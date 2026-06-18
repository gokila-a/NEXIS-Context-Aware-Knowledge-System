// State management
let state = {
    entries: [],
    contexts: [],
    currentEntry: null,
    selectedContext: null,
    allEntries: []
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    attachEventListeners();
});

async function initializeApp() {
    await loadContexts();
    await loadEntries();
}

function attachEventListeners() {
    document.getElementById('createContextBtn').addEventListener('click', createContext);
    document.getElementById('newEntryBtn').addEventListener('click', createNewEntry);
    document.getElementById('saveEntryBtn').addEventListener('click', saveEntry);
    document.getElementById('deleteEntryBtn').addEventListener('click', deleteEntry);
    document.getElementById('searchBar').addEventListener('input', handleSearch);
    document.getElementById('contextSelect').addEventListener('change', addContextToEntry);
    document.getElementById('addRelationBtn').addEventListener('click', addRelation);
    document.getElementById('toggleSidebar').addEventListener('click', toggleSidebar);
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// API calls
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Request failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        alert(error.message);
        throw error;
    }
}

// Contexts
async function loadContexts() {
    const data = await apiCall('/api/contexts');
    state.contexts = data.contexts || [];
    renderContexts();
    updateContextSelects();
}

function renderContexts() {
    const list = document.getElementById('contextList');
    list.innerHTML = '';
    
    const allItem = document.createElement('li');
    allItem.className = 'context-item' + (!state.selectedContext ? ' active' : '');
    allItem.innerHTML = '<span>All Entries</span>';
    allItem.addEventListener('click', () => selectContext(null));
    list.appendChild(allItem);
    
    state.contexts.forEach(context => {
        const item = document.createElement('li');
        item.className = 'context-item' + (state.selectedContext === context.id ? ' active' : '');
        item.innerHTML = `
            <span>${context.name}</span>
            <button onclick="deleteContext(${context.id}); event.stopPropagation();">×</button>
        `;
        item.addEventListener('click', () => selectContext(context.id));
        list.appendChild(item);
    });
}

async function createContext() {
    const input = document.getElementById('newContextName');
    const name = input.value.trim();
    
    if (!name) {
        alert('Please enter a context name');
        return;
    }
    
    await apiCall('/api/contexts', {
        method: 'POST',
        body: JSON.stringify({ name, user_id: 1 })
    });
    
    input.value = '';
    await loadContexts();
}

async function deleteContext(id) {
    if (!confirm('Delete this context?')) return;
    
    await apiCall(`/api/contexts?id=${id}`, { method: 'DELETE' });
    await loadContexts();
    await loadEntries();
}

function selectContext(contextId) {
    state.selectedContext = contextId;
    renderContexts();
    filterEntriesByContext();
}

function filterEntriesByContext() {
    if (!state.selectedContext) {
        state.entries = [...state.allEntries];
    } else {
        state.entries = state.allEntries.filter(entry => 
            entry.contexts && entry.contexts.some(c => c.id === state.selectedContext)
        );
    }
    renderEntries();
}

// Entries
async function loadEntries() {
    const data = await apiCall('/api/entries');
    state.allEntries = data.entries || [];
    filterEntriesByContext();
}

function renderEntries() {
    const list = document.getElementById('entriesList');
    list.innerHTML = '';
    
    state.entries.forEach(entry => {
        const item = document.createElement('li');
        item.className = 'entry-item' + (state.currentEntry?.id === entry.id ? ' active' : '');
        item.innerHTML = `
            <h3>${entry.title || 'Untitled'}</h3>
            <p>${formatDate(entry.created_at)}</p>
        `;
        item.addEventListener('click', () => selectEntry(entry.id));
        list.appendChild(item);
    });
}

async function selectEntry(id) {
    const data = await apiCall(`/api/entryById?id=${id}`);
    state.currentEntry = data.entry;
    
    await loadVersions(id);
    await loadRelations(id);
    
    renderEntryDetail();
    renderEntries();
}

function renderEntryDetail() {
    if (!state.currentEntry) {
        document.getElementById('emptyState').style.display = 'flex';
        document.getElementById('detailContent').style.display = 'none';
        return;
    }
    
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('detailContent').style.display = 'block';
    
    document.getElementById('entryTitle').value = state.currentEntry.title || '';
    document.getElementById('entryContent').value = state.currentEntry.content || '';
    document.getElementById('createdAt').textContent = formatDate(state.currentEntry.created_at);
    document.getElementById('updatedAt').textContent = formatDate(state.currentEntry.updated_at);
    
    renderEntryContexts();
    updateContextSelects();
    updateTargetEntrySelect();
}

function renderEntryContexts() {
    const container = document.getElementById('entryContexts');
    container.innerHTML = '';
    
    if (state.currentEntry.contexts) {
        state.currentEntry.contexts.forEach(context => {
            const tag = document.createElement('div');
            tag.className = 'context-tag';
            tag.innerHTML = `
                <span>${context.name}</span>
                <button onclick="removeContextFromEntry(${context.id})">×</button>
            `;
            container.appendChild(tag);
        });
    }
}

function updateContextSelects() {
    const select = document.getElementById('contextSelect');
    select.innerHTML = '<option value="">Add to context...</option>';
    
    state.contexts.forEach(context => {
        const option = document.createElement('option');
        option.value = context.id;
        option.textContent = context.name;
        select.appendChild(option);
    });
}

function updateTargetEntrySelect() {
    const select = document.getElementById('targetEntrySelect');
    select.innerHTML = '<option value="">Select entry...</option>';
    
    state.allEntries.forEach(entry => {
        if (entry.id !== state.currentEntry?.id) {
            const option = document.createElement('option');
            option.value = entry.id;
            option.textContent = entry.title || 'Untitled';
            select.appendChild(option);
        }
    });
}

async function createNewEntry() {
    const data = await apiCall('/api/entries', {
        method: 'POST',
        body: JSON.stringify({
            title: 'New Entry',
            content: '',
            user_id: 1
        })
    });
    
    await loadEntries();
    await selectEntry(data.entry.id);
}

async function saveEntry() {
    if (!state.currentEntry) return;
    
    const title = document.getElementById('entryTitle').value;
    const content = document.getElementById('entryContent').value;
    
    await apiCall(`/api/entryById?id=${state.currentEntry.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content })
    });
    
    await loadEntries();
    await selectEntry(state.currentEntry.id);
}

async function deleteEntry() {
    if (!state.currentEntry) return;
    if (!confirm('Delete this entry? This will also delete all relations and version history.')) return;
    
    await apiCall(`/api/entryById?id=${state.currentEntry.id}`, { method: 'DELETE' });
    
    state.currentEntry = null;
    await loadEntries();
    renderEntryDetail();
}

async function addContextToEntry() {
    const select = document.getElementById('contextSelect');
    const contextId = parseInt(select.value);
    
    if (!contextId || !state.currentEntry) return;
    
    await apiCall('/api/contexts', {
        method: 'POST',
        body: JSON.stringify({
            entry_id: state.currentEntry.id,
            context_id: contextId
        })
    });
    
    select.value = '';
    await selectEntry(state.currentEntry.id);
    await loadEntries();
}

async function removeContextFromEntry(contextId) {
    if (!state.currentEntry) return;
    
    await apiCall(`/api/contexts?entry_id=${state.currentEntry.id}&context_id=${contextId}`, {
        method: 'DELETE'
    });
    
    await selectEntry(state.currentEntry.id);
    await loadEntries();
}

// Relations
async function loadRelations(entryId) {
    const data = await apiCall(`/api/relations?entry_id=${entryId}`);
    state.currentEntry.relations = data.relations || [];
    renderRelations();
}

function renderRelations() {
    const container = document.getElementById('relationsList');
    container.innerHTML = '';
    
    if (!state.currentEntry.relations || state.currentEntry.relations.length === 0) {
        container.innerHTML = '<p style="color: #999;">No relations yet</p>';
        return;
    }
    
    state.currentEntry.relations.forEach(relation => {
        const item = document.createElement('div');
        item.className = 'relation-item';
        item.innerHTML = `
            <span><strong>${relation.relation_type}</strong>: ${relation.target_title || 'Unknown'}</span>
            <button onclick="deleteRelation(${relation.id})">Remove</button>
        `;
        container.appendChild(item);
    });
}

async function addRelation() {
    if (!state.currentEntry) return;
    
    const relationType = document.getElementById('relationTypeSelect').value;
    const targetId = parseInt(document.getElementById('targetEntrySelect').value);
    
    if (!targetId) {
        alert('Please select a target entry');
        return;
    }
    
    try {
        await apiCall('/api/relations', {
            method: 'POST',
            body: JSON.stringify({
                source_entry_id: state.currentEntry.id,
                target_entry_id: targetId,
                relation_type: relationType
            })
        });
        
        document.getElementById('targetEntrySelect').value = '';
        await loadRelations(state.currentEntry.id);
    } catch (error) {
        // Error already shown by apiCall
    }
}

async function deleteRelation(id) {
    await apiCall(`/api/relations?id=${id}`, { method: 'DELETE' });
    await loadRelations(state.currentEntry.id);
}

// Versions
async function loadVersions(entryId) {
    const data = await apiCall(`/api/versions?entry_id=${entryId}`);
    state.currentEntry.versions = data.versions || [];
    renderVersions();
}

function renderVersions() {
    const container = document.getElementById('versionsList');
    container.innerHTML = '';
    
    if (!state.currentEntry.versions || state.currentEntry.versions.length === 0) {
        container.innerHTML = '<p style="color: #999;">No version history yet</p>';
        return;
    }
    
    state.currentEntry.versions.forEach(version => {
        const item = document.createElement('li');
        item.className = 'version-item';
        item.innerHTML = `
            <div class="version-info">
                <strong>Version ${version.version_number}</strong>
                <p>${formatDate(version.created_at)}</p>
            </div>
            <button onclick="rollbackVersion(${version.id})">Restore</button>
        `;
        container.appendChild(item);
    });
}

async function rollbackVersion(versionId) {
    if (!confirm('Restore this version? The current state will be saved as a new version.')) return;
    
    await apiCall('/api/versions', {
        method: 'POST',
        body: JSON.stringify({
            entry_id: state.currentEntry.id,
            version_id: versionId
        })
    });
    
    await selectEntry(state.currentEntry.id);
    await loadEntries();
}

// Search
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    
    if (!query) {
        filterEntriesByContext();
        return;
    }
    
    const filtered = state.allEntries.filter(entry => 
        (entry.title || '').toLowerCase().includes(query)
    );
    
    if (state.selectedContext) {
        state.entries = filtered.filter(entry =>
            entry.contexts && entry.contexts.some(c => c.id === state.selectedContext)
        );
    } else {
        state.entries = filtered;
    }
    
    renderEntries();
}

// Utilities
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Make functions globally accessible for inline event handlers
window.deleteContext = deleteContext;
window.removeContextFromEntry = removeContextFromEntry;
window.deleteRelation = deleteRelation;
window.rollbackVersion = rollbackVersion;
