import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, map, shareReplay, tap } from "rxjs/operators";
import { LoadingService } from "../loading/loading.service";
import { MessagesService } from "../messages/messages.service";
import { Course, sortCoursesBySeqNo } from "../model/course";

@Injectable({
  providedIn: "root",
})
export class CoursesStore {
  private _coursesSubject = new BehaviorSubject<Course[]>([]);
  courses$: Observable<Course[]> = this._coursesSubject.asObservable();

  constructor(
    private _httpClient: HttpClient,
    private _loadingService: LoadingService,
    private _messagesService: MessagesService
  ) {
    this.loadAllCourses();
  }

  loadAllCourses() {
    const loadCourses$ = this._httpClient.get<Course[]>("/api/courses").pipe(
      map((res) => res["payload"]),
      catchError((err) => {
        const message = "Coud not load courses";
        this._messagesService.showErrors(message);
        return throwError(err);
      }),
      tap((courses) => this._coursesSubject.next(courses))
    );

    this._loadingService.showLoaderUntilCompleted(loadCourses$).subscribe();
  }

  saveCourse(courseId: string, changes: Partial<Course>): Observable<any> {
    const courses = this._coursesSubject.getValue();

    const index = courses.findIndex((course) => course.id === courseId);

    const newCourse: Course = {
      ...courses[index],
      ...changes,
    };

    const newCourses: Course[] = courses.slice(0);
    newCourses[index] = newCourse;

    this._coursesSubject.next(newCourses);

    return this._httpClient.put(`/api/courses/${courseId}`, changes).pipe(
      catchError((err) => {
        const message = "Could not save course";
        this._messagesService.showErrors(message);
        return throwError(err);
      }),
      shareReplay()
    );
  }

  filterByCategory(category: string): Observable<Course[]> {
    return this.courses$.pipe(
      map((courses) =>
        courses
          .filter((course) => course.category === category)
          .sort(sortCoursesBySeqNo)
      )
    );
  }
}
