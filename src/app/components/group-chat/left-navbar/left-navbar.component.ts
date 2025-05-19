import { Component, input, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tables } from '../../../types/supabase.types';

interface EventItem {
    id: string;
    image: string;
    title: string;
    subtitle: string;
    time: string;
    count: number;
}

@Component({
    selector: 'app-left-navbar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './left-navbar.component.html',
    styleUrls: ['./left-navbar.component.css']
})
export class LeftNavbarComponent {


    readonly events = input<Tables<'post_chat'>[]>([])
} 