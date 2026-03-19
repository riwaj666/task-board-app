import { useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from('profiles')   // make sure this table exists
        .select('*')

      console.log('DATA:', data)
      console.log('ERROR:', error)
    }

    testConnection()
  }, [])

  return <div>Check console</div>
}

export default App