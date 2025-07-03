import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Component({
    selector: 'app-perfil',
    templateUrl: './perfil.page.html',
})
export class PerfilPage implements OnInit {
    nombre: string = '';
    correo: string = '';
    token: string | null = null;

    constructor(
        private http: HttpClient,
        private storage: Storage,
        private loadingCtrl: LoadingController,
        private alertCtrl: AlertController,
        private toastCtrl: ToastController
    ) { }

    async ngOnInit() {
        await this.storage.create();
        this.token = await this.storage.get('token');
        if (this.token) {
            this.cargarPerfil();
        }
    }

    async cargarPerfil() {
        const loading = await this.loadingCtrl.create({ message: 'Cargando perfil...' });
        await loading.present();

        this.http.get<any>('https://backend-alertaya.onrender.com/api/usuarios/perfil', {
            headers: { Authorization: `Bearer ${this.token}` }
        }).subscribe({
            next: (data) => {
                this.nombre = data.nombre;
                this.correo = data.correo;
                loading.dismiss();
            },
            error: async (err) => {
                loading.dismiss();
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

        this.http.put('https://backend-alertaya.onrender.com/api/usuarios/perfil', datos, {
            headers: { Authorization: `Bearer ${this.token}` }
        }).subscribe({
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
