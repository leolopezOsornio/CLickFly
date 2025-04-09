import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddCorreoPage } from './add-correo.page';

describe('AddCorreoPage', () => {
  let component: AddCorreoPage;
  let fixture: ComponentFixture<AddCorreoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCorreoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
