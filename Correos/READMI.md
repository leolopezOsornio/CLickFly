# Agregar en android 
ionic cap add android

ionic build
ionic cap sync
ionic cap open android

# Subir a firebase 
npm install @angular/service-worker 
npm install -g firebase-tools1
ng add @angular/pwa
ionic build --prod   => se crea www
firebase login
firebase init
        select an option => Use an existing project
           selecionas tu proyecto
        use as your public directory? => www
        index.html => Yes
        whit GitHubo => No
        cinfir www/index.html => No
firebase deploy --only hosting


firebase logout
ELIMINA ---
        firebase.json
        .firebase

# CONTRA
l30l0p3z0s0rni0
