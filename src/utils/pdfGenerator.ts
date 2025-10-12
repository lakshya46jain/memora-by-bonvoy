import { jsPDF } from "jspdf";
import marriottLogo from "@/assets/marriott-bonvoy-logo.png";

interface MemoryEntry {
  id: string;
  experience_title: string;
  location: string | null;
  experience_timestamp: string | null;
  photos: string[] | null;
  note: string | null;
  created_at: string;
}

const COLORS = {
  primary: "#000000", // Black
  accent: "#E74C3C", // Marriott Orange/Red
  text: "#333333",
  lightText: "#666666",
  background: "#FFFFFF",
};

export const generateTravelJournalPDF = async (
  memories: MemoryEntry[],
  stayLocation: string = "Los Angeles",
  hotelName: string = "JW Marriott",
  userName: string = "Guest"
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Helper functions
  const addLogo = () => {
    try {
      doc.addImage(marriottLogo, "PNG", margin, 10, 60, 15);
    } catch (e) {
      doc.setFontSize(10);
      doc.setTextColor(COLORS.primary);
      doc.text("MARRIOTT BONVOY", margin, 15);
    }
  };

  const formatDate = (timestamp: string | null) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get date range
  const dates = memories
    .filter((m) => m.experience_timestamp)
    .map((m) => new Date(m.experience_timestamp!));
  const startDate =
    dates.length > 0
      ? dates.reduce((a, b) => (a < b ? a : b))
      : new Date();
  const endDate =
    dates.length > 0
      ? dates.reduce((a, b) => (a > b ? a : b))
      : new Date();

  const dateRange = `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  // PAGE 1: COVER PAGE
  doc.setFillColor(COLORS.primary);
  doc.rect(0, 0, pageWidth, 80, "F");

  doc.setTextColor("#FFFFFF");
  doc.setFontSize(12);
  doc.text("MARRIOTT BONVOY", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(10);
  doc.text("Trip Journal", pageWidth / 2, 28, { align: "center" });

  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text(stayLocation.toUpperCase(), pageWidth / 2, 50, {
    align: "center",
  });

  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text(hotelName, pageWidth / 2, 62, { align: "center" });

  doc.setFontSize(12);
  doc.text(dateRange, pageWidth / 2, 72, { align: "center" });

  // Decorative line
  doc.setDrawColor(COLORS.accent);
  doc.setLineWidth(2);
  doc.line(margin, 90, pageWidth - margin, 90);

  // Powered by Memora branding
  doc.setTextColor(COLORS.lightText);
  doc.setFontSize(10);
  doc.text("Powered by Memora", pageWidth / 2, pageHeight - 15, {
    align: "center",
  });

  // PAGE 2: HIGHLIGHTS
  doc.addPage();
  addLogo();

  doc.setFontSize(28);
  doc.setTextColor(COLORS.primary);
  doc.setFont("helvetica", "bold");
  doc.text("HIGHLIGHTS", margin, 50);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.text);

  let yPos = 65;
  memories.forEach((memory, index) => {
    if (yPos > pageHeight - 40) {
      doc.addPage();
      addLogo();
      yPos = 40;
    }

    // Bullet point
    doc.setFillColor(COLORS.accent);
    doc.circle(margin + 2, yPos - 1, 1.5, "F");

    // Experience title
    doc.text(memory.experience_title, margin + 8, yPos);

    // Date and location
    const details = [];
    if (memory.experience_timestamp) {
      details.push(formatDate(memory.experience_timestamp));
    }
    if (memory.location) {
      details.push(memory.location);
    }

    if (details.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(COLORS.lightText);
      doc.text(details.join(" • "), margin + 8, yPos + 4);
      doc.setFontSize(11);
      doc.setTextColor(COLORS.text);
    }

    yPos += details.length > 0 ? 12 : 8;
  });

  // PAGE 3+: INDIVIDUAL MEMORIES
  for (let i = 0; i < memories.length; i++) {
    const memory = memories[i];
    doc.addPage();
    addLogo();

    // Day header
    doc.setFontSize(10);
    doc.setTextColor(COLORS.accent);
    doc.text(`EXPERIENCE ${i + 1}`, margin, 40);

    // Title
    doc.setFontSize(24);
    doc.setTextColor(COLORS.primary);
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(memory.experience_title, contentWidth);
    doc.text(titleLines, margin, 50);

    let currentY = 50 + titleLines.length * 8;

    // Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.lightText);

    const detailsText = [];
    if (memory.experience_timestamp) {
      detailsText.push(
        `${formatDate(memory.experience_timestamp)} • ${formatTime(memory.experience_timestamp)}`
      );
    }
    if (memory.location) {
      detailsText.push(memory.location);
    }

    if (detailsText.length > 0) {
      doc.text(detailsText.join(" • "), margin, currentY + 5);
      currentY += 10;
    }

    // Photos
    if (memory.photos && memory.photos.length > 0) {
      currentY += 5;
      const photoSize = memory.photos.length === 1 ? 120 : 80;
      const photosPerRow = memory.photos.length === 1 ? 1 : 2;

      for (let j = 0; j < Math.min(memory.photos.length, 4); j++) {
        const row = Math.floor(j / photosPerRow);
        const col = j % photosPerRow;
        const xPos =
          margin + col * (photoSize + (photosPerRow > 1 ? 5 : 0));
        const yPos = currentY + row * (photoSize + 5);

        if (yPos + photoSize > pageHeight - margin) break;

        try {
          // Load and add actual photo
          const photoUrl = memory.photos[j];
          
          // Create a canvas to load and resize the image
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              try {
                // Add image to PDF
                doc.addImage(
                  img,
                  'JPEG',
                  xPos,
                  yPos,
                  photoSize,
                  photoSize * 0.6,
                  undefined,
                  'FAST'
                );
                resolve(true);
              } catch (e) {
                console.log("Error adding image to PDF:", e);
                // Fallback: show placeholder
                doc.setFillColor(240, 240, 240);
                doc.rect(xPos, yPos, photoSize, photoSize * 0.6, "F");
                resolve(true);
              }
            };
            img.onerror = () => {
              console.log("Failed to load image:", photoUrl);
              // Fallback: show placeholder
              doc.setFillColor(240, 240, 240);
              doc.rect(xPos, yPos, photoSize, photoSize * 0.6, "F");
              resolve(true);
            };
            img.src = photoUrl;
          });
        } catch (e) {
          console.log("Could not add image:", e);
          // Fallback: show placeholder
          doc.setFillColor(240, 240, 240);
          doc.rect(xPos, yPos, photoSize, photoSize * 0.6, "F");
        }
      }

      currentY += Math.ceil(Math.min(memory.photos.length, 4) / photosPerRow) * (photoSize * 0.6 + 5);
    }

    // Note
    if (memory.note) {
      currentY += 10;
      doc.setFontSize(10);
      doc.setTextColor(COLORS.text);
      doc.setFont("helvetica", "italic");

      const noteLines = doc.splitTextToSize(`"${memory.note}"`, contentWidth);
      
      if (currentY + noteLines.length * 5 > pageHeight - margin) {
        doc.addPage();
        addLogo();
        currentY = 40;
      }

      doc.text(noteLines, margin, currentY);
    }

    // Page footer with Memora branding
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.lightText);
    doc.text(
      `Powered by Memora`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // FINAL PAGE: THANK YOU
  doc.addPage();
  doc.setFillColor(COLORS.primary);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setTextColor("#FFFFFF");
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("MARRIOTT BONVOY", pageWidth / 2, pageHeight / 2 - 20, {
    align: "center",
  });

  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your stay", pageWidth / 2, pageHeight / 2, {
    align: "center",
  });

  doc.setFontSize(11);
  doc.setTextColor("#CCCCCC");
  doc.text(
    "Relive your trip and share your memories",
    pageWidth / 2,
    pageHeight / 2 + 15,
    { align: "center" }
  );

  doc.text(
    "Powered by Memora",
    pageWidth / 2,
    pageHeight / 2 + 25,
    { align: "center" }
  );

  // Save the PDF
  const fileName = `Travel-Journal-${stayLocation.replace(/\s+/g, "-")}-${new Date().getFullYear()}.pdf`;
  doc.save(fileName);

  return fileName;
};
