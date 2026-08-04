package com.nxthike.android.presentation.jobs

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nxthike.android.core.result.AppResult
import com.nxthike.android.data.remote.dto.JobDto
import com.nxthike.android.data.remote.dto.JobWriteDto
import com.nxthike.android.domain.repository.JobRepository
import com.nxthike.android.presentation.common.UiState
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

@HiltViewModel
class JobsViewModel @Inject constructor(private val repo: JobRepository) : ViewModel() {
    private val _list = MutableStateFlow<UiState<List<JobDto>>>(UiState.Idle)
    val list = _list.asStateFlow()
    private val _detail = MutableStateFlow<UiState<JobDto>>(UiState.Idle)
    val detail = _detail.asStateFlow()
    private val _save = MutableStateFlow<UiState<JobDto>>(UiState.Idle)
    val save = _save.asStateFlow()
    var search = ""
    var typeFilter: String? = null

    fun load(page: Int = 1) = viewModelScope.launch {
        _list.value = UiState.Loading
        _list.value = when (val r = repo.list(search.ifBlank { null }, typeFilter, page, "approved")) {
            is AppResult.Success -> UiState.Success(r.data.items)
            is AppResult.Error -> UiState.Error(r.message)
        }
    }

    fun loadDetail(id: String) = viewModelScope.launch {
        _detail.value = UiState.Loading
        _detail.value = when (val r = repo.get(id)) {
            is AppResult.Success -> UiState.Success(r.data)
            is AppResult.Error -> UiState.Error(r.message)
        }
    }

    fun save(id: String?, body: JobWriteDto) = viewModelScope.launch {
        _save.value = UiState.Loading
        val r = if (id == null || id == "new") repo.create(body) else repo.update(id, body)
        _save.value = when (r) {
            is AppResult.Success -> UiState.Success(r.data)
            is AppResult.Error -> UiState.Error(r.message)
        }
    }

    fun delete(id: String, onDone: () -> Unit) = viewModelScope.launch {
        if (repo.delete(id) is AppResult.Success) onDone()
    }
}
