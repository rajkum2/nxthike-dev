package com.nxthike.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.nxthike.android.presentation.navigation.NxtHikeNavHost
import com.nxthike.android.presentation.theme.NxtHikeTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            NxtHikeTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    NxtHikeNavHost()
                }
            }
        }
    }
}
