import { Component, DestroyRef, ElementRef, OnDestroy, ViewChild, inject, input, signal } from '@angular/core';
import { GroupChatService } from '../../../../services/group-chat.service';
import { Database, Tables } from '../../../types/supabase.types';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RealtimeChannel } from '@supabase/supabase-js';

@Component({
  selector: 'app-chat-window',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css'
})
export class ChatWindowComponent implements OnDestroy {
  readonly groupChatService = inject(GroupChatService)
  readonly supabaseClient = this.groupChatService.supabaseClient
  readonly activatedRoute = inject(ActivatedRoute)
  readonly destroyRef = inject(DestroyRef)

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  messageFormControl = new FormControl('')

  messages = signal<Database["public"]["Functions"]["get_post_chat_messages"]["Returns"]>([])
  chat = signal<Database["public"]["Functions"]["get_post_chat_details"]["Returns"] | null>(null)
  userId = signal<string | null>(null)
  groupChatExists = signal<boolean>(false)
  postChatId = signal<string | null>(null)

  private subscription: RealtimeChannel | null = null;

  async ngOnInit() {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async (params) => {
        const chatId = params['id'];
        if (chatId) {
          this.chat.set(await this.groupChatService.getGroupChatDetails(chatId))
          this.messages.set(await this.groupChatService.getGroupChatFromChatId(chatId))
        }
        this.userId.set((await this.supabaseClient?.auth.getUser())?.data.user?.id ?? null)
        this.groupChatExists.set(this.chat() !== null)
        this.postChatId.set(chatId)

        // Mark chat as read
        if (chatId && this.userId()) {
          await this.groupChatService.markAsRead(chatId);
        }

        // Set up realtime subscription after we have the chat ID
        this.setupRealtimeSubscription(chatId);

        // Scroll to bottom after messages load
        setTimeout(() => this.scrollToBottom(), 100);
      })
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  ngOnDestroy() {
    // Clean up subscription when component is destroyed
    this.subscription?.unsubscribe();
  }

  private setupRealtimeSubscription(chatId: string) {
    if (!this.supabaseClient) return;

    // Remove any existing subscription
    this.subscription?.unsubscribe();

    // Create a new subscription to the post_chat_messages table
    this.subscription = this.supabaseClient
      .channel('post_chat_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_chat_messages',
          filter: `post_chat_id=eq.${chatId}`
        },
        async (payload) => {
          // When a new message is received, refresh the messages
          const updatedMessages = await this.groupChatService.getGroupChatFromChatId(chatId);
          this.messages.set(updatedMessages);
          // Scroll to bottom when new messages arrive
          setTimeout(() => this.scrollToBottom(), 100);
        }
      )
      .subscribe();
  }

  async sendMessage() {
    if (this.messageFormControl.value && this.postChatId()) {
      const messageText = this.messageFormControl.value;
      const chatId = this.postChatId() ?? '';

      // Optimistically add the message to the UI
      const optimisticMessage = {
        post_id: '',
        message_id: 'temp-' + Date.now(),
        message_created_at: new Date().toISOString(),
        message_content: messageText,
        message_sender_id: this.userId() ?? '',
        profile_name: '',
        profile_id: '',
        user_email: ''
      };

      // Update the UI immediately with the new message
      this.messages.update(msgs => [...msgs, optimisticMessage]);

      // Clear the input field
      this.messageFormControl.reset();

      // Scroll to bottom after adding new message
      setTimeout(() => this.scrollToBottom(), 50);

      // Send the message to the server
      await this.groupChatService.sendMessage(messageText, chatId);
    }
  }
}
