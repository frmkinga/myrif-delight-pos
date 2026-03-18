import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://jszjlozunkffaxcjvqba.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_uPd-zNCRaPuiHnjQVW4h0g_R7H9f-ti"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)