import { Injectable } from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  showNotf(message?: string): void {
    if (!message) {
      message = 'An error occurred. Please try again later.';
    }
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      verticalPosition: 'top'
    });
  }
}
