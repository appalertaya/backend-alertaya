import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
    selector: 'app-perfil',
    templateUrl: './perfil.page.html',
    standalone: false
})
export class PerfilPage implements OnInit {
    nombre: string = '';
    correo: string = '';
    token: string | null = null;
    cargando: boolean = true;

    constructor(
        private http: HttpClient,
        private loadingCtrl: LoadingController,
        private alertCtrl: AlertController,
        private toastCtrl: ToastController,
        private router: Router
    ) { }

    async ngOnInit() {
        this.cargando = true;
        try {
            await this.obtenerToken();
            if (this.token) {
                await this.cargarPerfil();
            } else {
                const alert = await this.alertCtrl.create({
                    header: 'Sesión expirada',
                    message: 'Debes iniciar sesión nuevamente.',
                    buttons: ['OK']
                });
                await alert.present();
                this.router.navigate(['/login']);
            }
        } catch (e) {
            console.warn('Se produjo un error cargando el perfil.');
        } finally {
            this.cargando = false;
        }
    }

    ionViewWillEnter() {
        this.ngOnInit();
    }

    private async obtenerToken() {
        const result = await Preferences.get({ key: 'token' });
        this.token = result.value || null;
    }

    async cargarPerfil() {
        // const loading = await this.loadingCtrl.create({ message: 'Cargando perfil...' });
        // await loading.present();

        const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });

        this.http.get<any>('https://backend-alertaya.onrender.com/api/usuarios/perfil', { headers })
            .subscribe({
                next: (data) => {
                    this.nombre = data.nombre;
                    this.correo = data.email;
                    // loading.dismiss();
                },
                error: async () => {
                    // loading.dismiss();
                    const alert = await this.alertCtrl.create({
                        header: 'Error',
                        message: 'No se pudo cargar el perfil',
                        buttons: ['OK']
                    });
                    await alert.present();
                }
            });
    }

    async guardarCambios() {
        const loading = await this.loadingCtrl.create({ message: 'Guardando cambios...' });
        await loading.present();

        const datos = { nombre: this.nombre, correo: this.correo };
        const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });

        this.http.put('https://backend-alertaya.onrender.com/api/usuarios/perfil', datos, { headers })
            .subscribe({
                next: async () => {
                    loading.dismiss();
                    const toast = await this.toastCtrl.create({
                        message: 'Perfil actualizado correctamente',
                        duration: 2000,
                        color: 'success'
                    });
                    await toast.present();
                },
                error: async () => {
                    loading.dismiss();
                    const alert = await this.alertCtrl.create({
                        header: 'Error',
                        message: 'No se pudo actualizar el perfil',
                        buttons: ['OK']
                    });
                    await alert.present();
                }
            });
    }
}
