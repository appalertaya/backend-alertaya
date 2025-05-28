package io.ionic.starter;

import com.getcapacitor.BridgeActivity;

import android.os.Bundle;

public class MainActivity extends BridgeActivity {
      @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Fondo transparente para permitir que el mapa nativo se vea
    getWindow().setBackgroundDrawable(null);
  }

}
