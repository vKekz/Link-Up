import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment.production';
import { Database, Tables } from '../app/types/supabase.types';

type GroupChat = Tables<'post_chat'>;


@Injectable({
  providedIn: 'root'
})

export class GroupChatService {
  public readonly supabaseClient?: SupabaseClient<Database>;

  constructor() {

    if (this.supabaseClient) {
      return;
    }

    this.supabaseClient = createClient<Database>(environment.supabaseUrl, environment.supabaseKey);
  }

  public async getGroupChat(id: string): Promise<GroupChat> {
    if (!this.supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    console.log(id);

    const { data, error } = await this.supabaseClient.from('post_chat').select('*').eq("id", id)
    if (error) {
      throw new Error(error.message);
    }


    return data[0];
  }

}
