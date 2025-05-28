const fs = require('fs');
const path = require('path');

// Archivos a modificar
const files = [
  'android/app/capacitor.build.gradle',
  'android/app/build.gradle',
  'android/capacitor-cordova-android-plugins/build.gradle',
  'android/build.gradle'
];

// Reemplazos comunes
const replacements = [
  {
    find: /JavaVersion\.VERSION_\d+/g,
    replace: 'JavaVersion.VERSION_17'
  },
  {
    find: /com\.android\.tools\.build:gradle:\d+\.\d+(\.\d+)?/g,
    replace: 'com.android.tools.build:gradle:8.0.0'
  }
];

files.forEach(filePath => {
  const fullPath = path.resolve(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    replacements.forEach(({ find, replace }) => {
      content = content.replace(find, replace);
    });
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Actualizado: ${filePath}`);
  } else {
    console.warn(`⚠️ No se encontró: ${filePath}`);
  }
});
