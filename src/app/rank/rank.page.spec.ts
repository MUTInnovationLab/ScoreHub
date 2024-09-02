import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RankPage } from './rank.page';

describe('RankPage', () => {
  let component: RankPage;
  let fixture: ComponentFixture<RankPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RankPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
