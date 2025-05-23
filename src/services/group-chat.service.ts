import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment.production';
import { Database, Tables } from '../app/types/supabase.types';

type GroupChat = Tables<'post_chat'>;

// Define types for chat messages and chat with last message
type PostChatMessageData = Pick<Tables<'post_chat_messages'>, 'id' | 'message' | 'created_at' | 'sender_id'>;

export type GroupChatWithLastMessageAndUnreadCount = {
  post_id: string;
  post_chat_created_at: string;
  post_chat_id: string;
  chat_photo: string;
  title: string;
  message: string;
  sender_id: string;
  message_created_at: string;
  sender_email: string;
  unread_count: number;
}[]

type GroupChatWithLastMessage = GroupChat & {
  post_chat_messages: PostChatMessageData[]; // Array will contain 0 or 1 message
};

// Intermediate type for the data structure returned by the query
interface PostQueryResult {
  post_chat: GroupChatWithLastMessage[];
  // other selected fields from posts or post_participants if explicitly selected and needed
}

@Injectable({
  providedIn: 'root'
})

export class GroupChatService {
  public readonly supabaseClient?: SupabaseClient<Database>;

  constructor() {
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

  public async getGroupChatDetails(id: string): Promise<Database["public"]["Functions"]["get_post_chat_details"]["Returns"]> {
    if (!this.supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await this.supabaseClient.rpc("get_post_chat_details", {
      p_post_chat_id: id
    })

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
  public async getGroupChatFromChatId(id: string): Promise<Database["public"]["Functions"]["get_post_chat_messages"]["Returns"]> {

    if (!this.supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await this.supabaseClient.rpc("get_post_chat_messages", {
      post_chat_id: id
    })

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  public async getGroupChatWithLastMessage(): Promise<GroupChatWithLastMessageAndUnreadCount> {
    if (!this.supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    let userId = (await this.supabaseClient.auth.getUser()).data.user?.id

    if (!userId) {
      throw new Error('User not found');
    }

    // Fetch chats for posts the user participates in, with only the last message
    const { data, error } = await this.supabaseClient.rpc("get_user_chat_threads", { input_user_id: userId })

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Use Promise.all with map to handle asynchronous operations correctly
    const chatPromises = data.map(async (chat) => {
      const unreadCount = await this.getGroupChatNotReadCount(chat.post_chat_id);
      // Assuming 'chat' from rpc has all other necessary fields
      return { ...chat, unread_count: unreadCount };
    });

    const chatsWithUnreadCounts = await Promise.all(chatPromises);

    console.log(chatsWithUnreadCounts) // This will now log the fully populated array

    return chatsWithUnreadCounts;
  }

  public async getGroupChatNotReadCount(id: string): Promise<number> {
    if (!this.supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    let userId = (await this.supabaseClient.auth.getUser()).data.user?.id

    if (!userId) {
      throw new Error('User not found');
    }

    const { data, error } = await this.supabaseClient.rpc("get_unread_message_count", {
      p_user_id: userId,
      p_post_chat_id: id
    })


    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  public async sendMessage(message: string, postChatId: string): Promise<boolean> {
    if (!this.supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    let userId = (await this.supabaseClient.auth.getUser()).data.user?.id

    if (!userId) {
      throw new Error('User not found');
    }

    const { data, error } = await this.supabaseClient.from('post_chat_messages').insert({
      message: message,
      post_chat_id: postChatId,
      sender_id: userId,

    })

    if (error) {
      throw new Error(error.message);
    }
    return !error;
  }

  public async markAsRead(postChatId: string): Promise<boolean> {
    if (!this.supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    let userId = (await this.supabaseClient.auth.getUser()).data.user?.id

    if (!userId) {
      throw new Error('User not found');
    }

    const { data, error } = await this.supabaseClient.rpc("mark_chat_as_seen", {
      p_user_id: userId,
      p_post_chat_id: postChatId
    })

    if (error) {
      throw new Error(error.message);
    }

    return !error;
  }

}
