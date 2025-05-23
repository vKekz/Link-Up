import { Component, computed, input, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupChatService, GroupChatWithLastMessageAndUnreadCount } from '../../../../services/group-chat.service';

import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-left-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './left-navbar.component.html',
    styleUrls: ['./left-navbar.component.css']
})
export class LeftNavbarComponent {


    events = signal<GroupChatWithLastMessageAndUnreadCount>([])



    constructor(
        private groupChatService: GroupChatService
    ) {
        this.groupChatService.getGroupChatWithLastMessage().then((groupChat) => {
            console.log(groupChat)
            this.events.set(groupChat)
        });

    }

} 