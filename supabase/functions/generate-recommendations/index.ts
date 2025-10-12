import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface Experience {
  experience_id: string;
  title: string;
  short_description: string;
  tags: string[];
  distance_km?: number;
  available_time_window?: string;
  image_url: string;
  is_partner: boolean;
  capacity_remaining?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
}

// Mock experience catalog for Los Angeles
const experienceCatalog: Experience[] = [
  {
    experience_id: "exp_1",
    title: "Griffith Observatory",
    short_description: "Iconic hilltop observatory with stunning views of the Hollywood Sign and LA skyline. Features planetarium shows and free telescope viewing.",
    tags: ["observatory", "views", "astronomy", "outdoor", "educational"],
    distance_km: 5.2,
    available_time_window: "12:00-22:00",
    image_url: "https://images.unsplash.com/photo-1534190239940-9ba8944ea261?q=80&w=2069",
    is_partner: true,
    capacity_remaining: 100,
    location: "2800 E Observatory Rd",
    latitude: 34.1184,
    longitude: -118.3004
  },
  {
    experience_id: "exp_2",
    title: "The Getty Center",
    short_description: "World-class art museum with stunning architecture, beautiful gardens, and panoramic city views. Free admission.",
    tags: ["museum", "art", "architecture", "gardens", "culture"],
    distance_km: 8.1,
    available_time_window: "10:00-17:30",
    image_url: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?q=80&w=2070",
    is_partner: true,
    capacity_remaining: 150,
    location: "1200 Getty Center Dr",
    latitude: 34.0780,
    longitude: -118.4741
  },
  {
    experience_id: "exp_3",
    title: "Grand Central Market",
    short_description: "Historic downtown food hall featuring diverse cuisines from tacos to Thai, artisan coffee, and fresh produce.",
    tags: ["food", "dining", "market", "local", "diverse"],
    distance_km: 2.5,
    available_time_window: "08:00-22:00",
    image_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2074",
    is_partner: true,
    capacity_remaining: 200,
    location: "317 S Broadway",
    latitude: 34.0509,
    longitude: -118.2490
  },
  {
    experience_id: "exp_4",
    title: "Blue Bottle Coffee",
    short_description: "Artisanal coffee roastery with minimalist aesthetic. Known for their single-origin pour-overs and specialty lattes.",
    tags: ["coffee", "cafe", "artisan", "indoor", "work-friendly"],
    distance_km: 3.2,
    available_time_window: "07:00-19:00",
    image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070",
    is_partner: true,
    capacity_remaining: 40,
    location: "582 Mateo St",
    latitude: 34.0347,
    longitude: -118.2333
  },
  {
    experience_id: "exp_5",
    title: "The Broad Museum",
    short_description: "Contemporary art museum showcasing postwar and contemporary art. Free admission, home to works by Andy Warhol and Jeff Koons.",
    tags: ["museum", "contemporary art", "culture", "indoor", "free"],
    distance_km: 2.8,
    available_time_window: "11:00-17:00",
    image_url: "https://images.unsplash.com/photo-1569783721853-fe0e3e97836c?q=80&w=2070",
    is_partner: true,
    capacity_remaining: 120,
    location: "221 S Grand Ave",
    latitude: 34.0546,
    longitude: -118.2509
  },
  {
    experience_id: "exp_6",
    title: "Santa Monica Pier",
    short_description: "Iconic oceanfront pier featuring amusement park rides, arcade games, street performers, and stunning Pacific views.",
    tags: ["beach", "outdoor", "entertainment", "family", "landmark"],
    distance_km: 15.3,
    available_time_window: "06:00-00:00",
    image_url: "https://images.unsplash.com/photo-1583008957629-f6f3c0e0f9f1?q=80&w=2070",
    is_partner: true,
    capacity_remaining: 500,
    location: "200 Santa Monica Pier",
    latitude: 34.0094,
    longitude: -118.4973
  },
  {
    experience_id: "exp_7",
    title: "Republique",
    short_description: "French-inspired bistro in a historic building. Known for exceptional pastries, brunch, and seasonal dinner menu.",
    tags: ["restaurant", "french", "dining", "brunch", "fine-dining"],
    distance_km: 4.5,
    available_time_window: "08:00-22:00",
    image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070",
    is_partner: true,
    capacity_remaining: 60,
    location: "624 S La Brea Ave",
    latitude: 34.0630,
    longitude: -118.3439
  },
  {
    experience_id: "exp_8",
    title: "Hollywood Walk of Fame",
    short_description: "Famous sidewalk featuring stars honoring entertainment industry legends. Explore Hollywood Boulevard's iconic landmarks.",
    tags: ["landmark", "outdoor", "hollywood", "sightseeing", "free"],
    distance_km: 6.8,
    available_time_window: "00:00-24:00",
    image_url: "https://images.unsplash.com/photo-1518416177092-ec985e4d6c14?q=80&w=2070",
    is_partner: false,
    location: "Hollywood Blvd",
    latitude: 34.1016,
    longitude: -118.3267
  },
  {
    experience_id: "exp_9",
    title: "Intelligentsia Coffee",
    short_description: "Direct-trade coffee pioneer with expertly crafted espresso drinks. Modern space perfect for remote work or meetings.",
    tags: ["coffee", "cafe", "work-friendly", "indoor", "artisan"],
    distance_km: 7.2,
    available_time_window: "06:30-20:00",
    image_url: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=2070",
    is_partner: true,
    capacity_remaining: 35,
    location: "3922 Sunset Blvd",
    latitude: 34.0978,
    longitude: -118.2873
  },
  {
    experience_id: "exp_10",
    title: "LA Live Entertainment Complex",
    short_description: "Entertainment complex featuring concert venues, restaurants, clubs, and the Grammy Museum. Check for live events.",
    tags: ["entertainment", "events", "dining", "nightlife", "music"],
    distance_km: 3.1,
    available_time_window: "10:00-02:00",
    image_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070",
    is_partner: true,
    capacity_remaining: 300,
    location: "800 W Olympic Blvd",
    latitude: 34.0430,
    longitude: -118.2673
  },
  {
    experience_id: "exp_11",
    title: "Runyon Canyon Park",
    short_description: "Popular hiking trail with stunning views of LA and the Hollywood Sign. Dog-friendly paths through scenic wilderness.",
    tags: ["hiking", "outdoor", "nature", "fitness", "views"],
    distance_km: 7.5,
    available_time_window: "06:00-20:00",
    image_url: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070",
    is_partner: false,
    location: "2000 N Fuller Ave",
    latitude: 34.1105,
    longitude: -118.3531
  },
  {
    experience_id: "exp_12",
    title: "Venice Beach Boardwalk",
    short_description: "Iconic beachfront promenade featuring street performers, vendors, Muscle Beach, and vibrant local culture.",
    tags: ["beach", "outdoor", "culture", "entertainment", "shopping"],
    distance_km: 18.2,
    available_time_window: "00:00-24:00",
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070",
    is_partner: false,
    location: "Venice Beach",
    latitude: 33.9850,
    longitude: -118.4695
  }
];

async function createEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user preferences
    const { data: preferences, error: prefsError } = await supabase
      .from('user_preferences')
      .select('interests, activity_types, dining_preferences, travel_style')
      .eq('user_id', user_id)
      .maybeSingle();

    if (prefsError) {
      console.error('Error fetching preferences:', prefsError);
      throw prefsError;
    }

    // Fetch viewed/disliked recommendations
    const { data: viewedRecs, error: viewedError } = await supabase
      .from('viewed_recommendations')
      .select('recommendation_id, decision')
      .eq('user_id', user_id);

    if (viewedError) {
      console.error('Error fetching viewed recommendations:', viewedError);
    }

    const dislikedIds = new Set(
      viewedRecs?.filter(v => v.decision === 'skipped').map(v => v.recommendation_id) || []
    );

    // Create user preference text
    const userPreferenceText = [
      ...(preferences?.interests || []),
      ...(preferences?.activity_types || []),
      ...(preferences?.dining_preferences || []),
      ...(preferences?.travel_style || [])
    ].join(', ');

    console.log('User preferences:', userPreferenceText);

    // Generate embeddings
    const userEmbedding = await createEmbedding(userPreferenceText);
    
    // Filter out disliked experiences
    const availableExperiences = experienceCatalog.filter(
      exp => !dislikedIds.has(exp.experience_id)
    );

    // Score each experience
    const scoredExperiences = await Promise.all(
      availableExperiences.map(async (exp) => {
        const expText = `${exp.title} ${exp.short_description} ${exp.tags.join(' ')}`;
        const expEmbedding = await createEmbedding(expText);
        const similarityScore = cosineSimilarity(userEmbedding, expEmbedding);
        
        // Apply proximity bonus (closer is better)
        const proximityBonus = exp.distance_km ? Math.max(0, (20 - exp.distance_km) / 20) * 0.2 : 0;
        
        // Partner bonus
        const partnerBonus = exp.is_partner ? 0.1 : 0;
        
        const finalScore = similarityScore + proximityBonus + partnerBonus;
        
        return { ...exp, score: finalScore };
      })
    );

    // Sort by score and apply diversity
    scoredExperiences.sort((a, b) => b.score - a.score);
    
    // Select top recommendations with diversity
    const recommendations: any[] = [];
    const usedCategories = new Set<string>();
    const maxPerCategory = 2;
    const categoryCount: Record<string, number> = {};

    for (const exp of scoredExperiences) {
      if (recommendations.length >= 10) break;
      
      const primaryTag = exp.tags[0];
      const count = categoryCount[primaryTag] || 0;
      
      if (count < maxPerCategory) {
        // Generate personalized explanation
        const matchedPrefs = [
          ...(preferences?.interests || []),
          ...(preferences?.activity_types || []),
          ...(preferences?.dining_preferences || [])
        ].filter(pref => 
          exp.tags.some(tag => tag.toLowerCase().includes(pref.toLowerCase())) ||
          exp.title.toLowerCase().includes(pref.toLowerCase()) ||
          exp.short_description.toLowerCase().includes(pref.toLowerCase())
        );

        const why_this_for_you = matchedPrefs.length > 0
          ? `Because you enjoy ${matchedPrefs.slice(0, 2).join(' and ')}, this experience matches your interests perfectly`
          : `This is a popular local spot that many travelers with similar preferences have enjoyed`;

        recommendations.push({
          experience_id: exp.experience_id,
          title: exp.title,
          short_description: exp.short_description,
          tags: exp.tags,
          distance_km: exp.distance_km,
          available_time_window: exp.available_time_window,
          why_this_for_you,
          image_url: exp.image_url,
          is_partner: exp.is_partner,
          capacity_remaining: exp.capacity_remaining,
          location: exp.location,
          score: exp.score
        });
        
        categoryCount[primaryTag] = count + 1;
        usedCategories.add(primaryTag);
      }
    }

    // If we don't have enough, add top-rated experiences
    if (recommendations.length < 5) {
      const remaining = scoredExperiences
        .filter(exp => !recommendations.find(r => r.experience_id === exp.experience_id))
        .slice(0, 5 - recommendations.length);
      
      for (const exp of remaining) {
        recommendations.push({
          experience_id: exp.experience_id,
          title: exp.title,
          short_description: exp.short_description,
          tags: exp.tags,
          distance_km: exp.distance_km,
          available_time_window: exp.available_time_window,
          why_this_for_you: "This is a trending local spot that matches the style of experiences you prefer",
          image_url: exp.image_url,
          is_partner: exp.is_partner,
          capacity_remaining: exp.capacity_remaining,
          location: exp.location,
          score: exp.score
        });
      }
    }

    console.log(`Generated ${recommendations.length} recommendations for user ${user_id}`);

    return new Response(
      JSON.stringify({ recommendations }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-recommendations:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});