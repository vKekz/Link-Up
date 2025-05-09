import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent {
  @Output() eventCreated = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  event = {
    title: '',
    tag: '',
    address: '',
    description: ''
  };

  submitForm() {
    const newGroup = {
      name: this.event.title,
      createdAt: new Date(),
      users: [],
    };

    const newEvent = {
      ...this.event,
      dateCreated: new Date(),
      group: newGroup
    };

    this.eventCreated.emit(newEvent);
    this.resetForm();
  }

  cancel() {
    this.resetForm();
    this.close.emit();
  }

  private resetForm() {
    this.event = {
      title: '',
      tag: '',
      address: '',
      description: ''
    };
  }
}
