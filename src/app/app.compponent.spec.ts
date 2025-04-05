import { AppComponent } from "./app.component";
import { TestBed } from "@angular/core/testing";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe("AppComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        AppComponent
    ],
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  });

  it("should create the app", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    // @ts-ignore
    expect(app).toBeTruthy();
  });

});
