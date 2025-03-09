import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const ENEDIS_CONFIG = {
  clientId: 'Y_LuB7HsQW3JWYudw7HRmN28FN8a',
  clientSecret: 'Pb9H1p8zJ4IfX0xca5c7lficGo4a',
  redirectUri: 'https://abienergie.github.io/Simulator/#/oauth/callback',
  tokenUrl: 'https://gw.hml.api.enedis.fr/oauth2/v3/token'
}

console.log('Enedis Auth Function Starting...')

serve(async (req) => {
  console.log('Received request:', req.url)
  
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    })
  }

  try {
    // Extraire les paramètres de l'URL
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const usagePointId = url.searchParams.get('usage_point_id')

    console.log('Received params:', { 
      code: code ? '***' + code.slice(-6) : null,
      state,
      usagePointId
    })

    // Si pas de code, retourner la page de test
    if (!code) {
      return new Response(
        'Enedis Auth Function is running!',
        { 
          headers: { 
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      )
    }

    if (state !== 'AbieLink1') {
      throw new Error('État invalide')
    }

    // Échange du code contre un token
    console.log('Exchanging code for token...')
    const tokenResponse = await fetch(ENEDIS_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: ENEDIS_CONFIG.clientId,
        client_secret: ENEDIS_CONFIG.clientSecret,
        code,
        redirect_uri: ENEDIS_CONFIG.redirectUri
      })
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json()
      console.error('Token exchange error:', error)
      throw new Error(error.error_description || 'Échec de l\'échange du token')
    }

    const data = await tokenResponse.json()
    console.log('Token received successfully')

    // Rediriger vers l'application avec les paramètres
    const appUrl = new URL('https://abienergie.github.io/Simulator/#/oauth/callback')
    appUrl.searchParams.set('access_token', data.access_token)
    if (data.refresh_token) {
      appUrl.searchParams.set('refresh_token', data.refresh_token)
    }
    if (usagePointId) {
      appUrl.searchParams.set('usage_point_id', usagePointId)
    }

    console.log('Redirecting to:', appUrl.toString().replace(/access_token=([^&]+)/, 'access_token=***'))

    return new Response(null, {
      status: 302,
      headers: {
        'Location': appUrl.toString(),
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Function error:', error)
    
    const errorUrl = new URL('https://abienergie.github.io/Simulator/#/oauth/callback')
    errorUrl.searchParams.set('error', error.message)
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': errorUrl.toString(),
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
})