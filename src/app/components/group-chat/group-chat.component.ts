import { Component, signal } from '@angular/core';
import { GroupChatService, GroupChatWithLastMessageAndUnreadCount } from '../../../services/group-chat.service';
import { LeftNavbarComponent } from './left-navbar/left-navbar.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Database } from '../../types/supabase.types';
@Component({
  selector: 'app-group-chat',
  imports: [LeftNavbarComponent, ChatWindowComponent],
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.css'],
  standalone: true,
})
export class GroupChatComponent {
}
