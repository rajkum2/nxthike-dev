package com.nxthike.android.presentation.home

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nxthike.android.presentation.common.NxtTopBar

private data class Tile(val title: String, val subtitle: String, val icon: ImageVector, val onClick: () -> Unit)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onJobs: () -> Unit,
    onEvents: () -> Unit,
    onCourses: () -> Unit,
    onCompanies: () -> Unit,
    onHiring: () -> Unit,
    onDashboard: () -> Unit,
) {
    val tiles = listOf(
        Tile("Jobs & Internships", "Browse and manage openings", Icons.Default.Work, onJobs),
        Tile("Hiring CRM", "Pipeline, candidates, roles", Icons.Default.People, onHiring),
        Tile("Events", "Webinars and meetups", Icons.Default.Event, onEvents),
        Tile("Courses", "Learning catalog", Icons.Default.School, onCourses),
        Tile("Companies", "Employer directory", Icons.Default.Business, onCompanies),
        Tile("Admin stats", "Platform metrics", Icons.Default.Dashboard, onDashboard),
    )
    Scaffold(topBar = { NxtTopBar("NxtHike") }) { pad ->
        Column(Modifier.padding(pad).padding(16.dp)) {
            Text("What would you like to manage?", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(12.dp))
            LazyVerticalGrid(columns = GridCells.Fixed(2), verticalArrangement = Arrangement.spacedBy(12.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                items(tiles) { t ->
                    Card(
                        modifier = Modifier.fillMaxWidth().height(140.dp).clickable(onClick = t.onClick),
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                    ) {
                        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.SpaceBetween) {
                            Icon(t.icon, null, tint = MaterialTheme.colorScheme.primary)
                            Column {
                                Text(t.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                                Text(t.subtitle, style = MaterialTheme.typography.bodySmall)
                            }
                        }
                    }
                }
            }
        }
    }
}
