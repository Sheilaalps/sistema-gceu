import { createClient } from '@supabase/supabase-js';

// Pegue esses valores no seu painel do Supabase (Settings > API)
const supabaseUrl = 'https://gvrglrfemzidxjffsatk.supabase.co';
const supabaseAnonKey = 'sb_publishable_xpCd7BtQ8N8dSS-pns4sAg_Sr9yhkGK';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
