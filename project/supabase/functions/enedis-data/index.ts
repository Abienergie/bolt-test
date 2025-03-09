import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const ENEDIS_API_URL = 'https://gw.hml.api.enedis.fr/v5/metering_data'

serve(async (req) => {
  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Non authentifié')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Non authentifié')
    }

    const { action, prm, startDate, endDate } = await req.json()

    if (action === 'get_consumption') {
      // Récupérer le token Enedis depuis la base de données
      const { data: tokenData, error: tokenError } = await supabase
        .from('enedis_tokens')
        .select('access_token, expires_at')
        .eq('user_id', user.id)
        .single()

      if (tokenError || !tokenData?.access_token) {
        throw new Error('Token Enedis non trouvé')
      }

      // Vérifier si le token est expiré
      if (new Date(tokenData.expires_at) <= new Date()) {
        throw new Error('Token Enedis expiré')
      }

      // Appeler l'API Enedis
      const response = await fetch(
        `${ENEDIS_API_URL}/daily_consumption?usage_point_id=${prm}&start=${startDate}&end=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Accept': 'application/json'
          }
        }
      )

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        console.error('Erreur API Enedis:', error)
        throw new Error('Erreur lors de la récupération des données Enedis')
      }

      const data = await response.json()
      
      // Stocker les données dans Supabase
      const consumptionData = data.meter_reading.interval_reading.map((reading: any) => ({
        prm,
        date: reading.date,
        value: reading.value,
        user_id: user.id
      }))

      const { error: insertError } = await supabase
        .from('consumption_data')
        .upsert(consumptionData)

      if (insertError) {
        console.error('Erreur lors du stockage des données:', insertError)
      }

      return new Response(
        JSON.stringify(data),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Action invalide')

  } catch (error) {
    console.error('Erreur Edge Function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
})