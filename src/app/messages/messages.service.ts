import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { filter } from "rxjs/operators";

@Injectable()
export class MessagesService {
  private _messagesSubject = new BehaviorSubject<string[]>([]);
  errors$: Observable<string[]> = this._messagesSubject
    .asObservable()
    .pipe(filter((messages) => messages && messages.length > 0));
  showErrors(...errors: string[]) {
    this._messagesSubject.next(errors);
  }
}
