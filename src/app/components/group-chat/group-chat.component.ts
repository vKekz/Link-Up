import { Component, signal } from '@angular/core';
import { GroupChatService } from '../../../services/group-chat.service';
import { ActivatedRoute } from '@angular/router';
import { LeftNavbarComponent } from './left-navbar/left-navbar.component';
import { Tables } from '../../types/supabase.types';

@Component({
  selector: 'app-group-chat',
  imports: [LeftNavbarComponent],
  templateUrl: './group-chat.component.html',
  styleUrl: './group-chat.component.css',
  standalone: true,
})
export class GroupChatComponent {

  readonly events = signal<Tables<'post_chat'>[]>([])

  constructor(
    private groupChatService: GroupChatService,
    private route: ActivatedRoute
  ) {
    const chatId = this.route.snapshot.paramMap.get('id');
    if (!chatId) {
      console.error('GroupChatComponent: no chat id found in route parameters');
      return;
    }
    this.groupChatService.getGroupChat(chatId).then((groupChat) => {
      console.log(groupChat);
      this.events.set([groupChat])
    });
  }
}
