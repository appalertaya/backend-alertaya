import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReporteDetalleModalComponent } from './reporte-detalle-modal.component';

describe('ReporteDetalleModalComponent', () => {
  let component: ReporteDetalleModalComponent;
  let fixture: ComponentFixture<ReporteDetalleModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteDetalleModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReporteDetalleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
