// =============================================
// Admin Panel - M7 Marcenaria
// =============================================
(function () {
  'use strict';

  // Auth check
  if (sessionStorage.getItem('m7_admin_auth') !== 'true') {
    window.location.href = 'index.html';
    return;
  }

  // ========================================
  // NAVIGATION
  // ========================================
  var sidebarLinks = document.querySelectorAll('.sidebar-link');
  var sections = document.querySelectorAll('.admin-section');
  var pageTitle = document.getElementById('pageTitle');
  var sidebar = document.getElementById('sidebar');
  var sidebarOverlay = document.getElementById('sidebarOverlay');
  var mobileMenuBtn = document.getElementById('mobileMenuBtn');

  var sectionTitles = {
    dashboard: 'Dashboard',
    settings: 'Configurações do Site',
    environments: 'Ambientes'
  };

  function switchSection(name) {
    sections.forEach(function (s) { s.classList.remove('active'); });
    sidebarLinks.forEach(function (l) { l.classList.remove('active'); });
    var sec = document.getElementById('sec-' + name);
    if (sec) sec.classList.add('active');
    var link = document.querySelector('[data-section="' + name + '"]');
    if (link) link.classList.add('active');
    pageTitle.textContent = sectionTitles[name] || name;
    closeSidebar();

    if (name === 'dashboard') loadDashboard();
    if (name === 'settings') loadSettings();
    if (name === 'environments') loadEnvironments();
  }

  sidebarLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      switchSection(this.dataset.section);
    });
  });

  // Mobile sidebar
  function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
  }

  mobileMenuBtn.addEventListener('click', openSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  // Logout
  document.getElementById('btnLogout').addEventListener('click', function () {
    sessionStorage.removeItem('m7_admin_auth');
    window.location.href = 'index.html';
  });

  // ========================================
  // TOAST
  // ========================================
  function toast(msg, type) {
    var container = document.getElementById('toastContainer');
    var el = document.createElement('div');
    el.className = 'toast toast-' + (type || 'success');
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(function () { el.remove(); }, 3500);
  }

  // ========================================
  // MODAL
  // ========================================
  window.closeModal = function (id) {
    document.getElementById(id).classList.remove('active');
  };

  function openModal(id) {
    document.getElementById(id).classList.add('active');
  }

  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });

  // ========================================
  // FILE UPLOAD HELPER
  // ========================================
  async function uploadFile(file, bucket, folder) {
    var ext = file.name.split('.').pop();
    var fileName = folder + '/' + Date.now() + '_' + Math.random().toString(36).substring(2, 8) + '.' + ext;

    var { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    var { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  // Setup upload preview for settings
  function setupUploadPreview(areaId, previewId) {
    var area = document.getElementById(areaId);
    var preview = document.getElementById(previewId);
    var input = area.querySelector('input[type="file"]');

    input.addEventListener('change', function () {
      if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
          preview.src = e.target.result;
          preview.style.display = 'block';
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  setupUploadPreview('uploadLogo', 'previewLogo');
  setupUploadPreview('uploadHero', 'previewHero');
  setupUploadPreview('uploadAbout', 'previewAbout');

  // ========================================
  // DASHBOARD
  // ========================================
  async function loadDashboard() {
    try {
      var { count: envCount } = await supabase.from('environments').select('*', { count: 'exact', head: true });
      var { count: homeCount } = await supabase.from('environments').select('*', { count: 'exact', head: true }).eq('show_on_home', true);
      var { count: imgCount } = await supabase.from('environment_images').select('*', { count: 'exact', head: true });

      document.getElementById('statEnv').textContent = envCount || 0;
      document.getElementById('statHome').textContent = homeCount || 0;
      document.getElementById('statImg').textContent = imgCount || 0;
    } catch (err) {
      console.error('Dashboard error:', err);
    }
  }

  // ========================================
  // SETTINGS
  // ========================================
  async function loadSettings() {
    try {
      var { data } = await supabase.from('site_settings').select('*').limit(1).single();
      if (!data) return;

      document.getElementById('setWhatsapp').value = data.whatsapp || '';
      document.getElementById('setTelefoneFixo').value = data.telefone_fixo || '';
      document.getElementById('setEmail').value = data.email || '';
      document.getElementById('setInstagram').value = data.instagram || '';
      document.getElementById('setFacebook').value = data.facebook || '';
      document.getElementById('setTiktok').value = data.tiktok || '';
      document.getElementById('setRua').value = data.endereco_rua || '';
      document.getElementById('setNumero').value = data.endereco_numero || '';
      document.getElementById('setBairro').value = data.endereco_bairro || '';
      document.getElementById('setCidade').value = data.endereco_cidade || '';
      document.getElementById('setEstado').value = data.endereco_estado || '';
      document.getElementById('setCep').value = data.endereco_cep || '';
      document.getElementById('setHorario').value = data.horario_funcionamento || '';

      if (data.logo_url) {
        document.getElementById('previewLogo').src = data.logo_url;
        document.getElementById('previewLogo').style.display = 'block';
      }
      if (data.hero_image_url) {
        document.getElementById('previewHero').src = data.hero_image_url;
        document.getElementById('previewHero').style.display = 'block';
      }
      if (data.about_image_url) {
        document.getElementById('previewAbout').src = data.about_image_url;
        document.getElementById('previewAbout').style.display = 'block';
      }
    } catch (err) {
      console.error('Settings load error:', err);
    }
  }

  document.getElementById('settingsForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    var btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
      var updates = {
        whatsapp: document.getElementById('setWhatsapp').value,
        telefone_fixo: document.getElementById('setTelefoneFixo').value,
        email: document.getElementById('setEmail').value,
        instagram: document.getElementById('setInstagram').value,
        facebook: document.getElementById('setFacebook').value,
        tiktok: document.getElementById('setTiktok').value,
        endereco_rua: document.getElementById('setRua').value,
        endereco_numero: document.getElementById('setNumero').value,
        endereco_bairro: document.getElementById('setBairro').value,
        endereco_cidade: document.getElementById('setCidade').value,
        endereco_estado: document.getElementById('setEstado').value,
        endereco_cep: document.getElementById('setCep').value,
        horario_funcionamento: document.getElementById('setHorario').value
      };

      // Upload images if changed
      var logoFile = document.querySelector('#uploadLogo input[type="file"]').files[0];
      var heroFile = document.querySelector('#uploadHero input[type="file"]').files[0];
      var aboutFile = document.querySelector('#uploadAbout input[type="file"]').files[0];

      if (logoFile) updates.logo_url = await uploadFile(logoFile, 'site-assets', 'logo');
      if (heroFile) updates.hero_image_url = await uploadFile(heroFile, 'site-assets', 'hero');
      if (aboutFile) updates.about_image_url = await uploadFile(aboutFile, 'site-assets', 'about');

      // Check if settings exist
      var { data: existing } = await supabase.from('site_settings').select('id').limit(1).single();

      if (existing) {
        await supabase.from('site_settings').update(updates).eq('id', existing.id);
      } else {
        await supabase.from('site_settings').insert(updates);
      }

      toast('Configurações salvas com sucesso!');
    } catch (err) {
      console.error('Settings save error:', err);
      toast('Erro ao salvar configurações', 'error');
    }

    btn.disabled = false;
    btn.textContent = 'Salvar Configurações';
  });

  // ========================================
  // ENVIRONMENTS
  // ========================================
  async function loadEnvironments() {
    var list = document.getElementById('envList');
    list.innerHTML = '<div class="loading"><div class="spinner"></div><p>Carregando...</p></div>';

    try {
      var { data, error } = await supabase
        .from('environments')
        .select('*, environment_images(id, image_url, is_cover)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        list.innerHTML = '<p style="color:#555;text-align:center;padding:2rem">Nenhum ambiente cadastrado.</p>';
        return;
      }

      list.innerHTML = '';
      data.forEach(function (env) {
        var images = env.environment_images || [];
        var coverImg = images.find(function (i) { return i.is_cover; });
        var coverUrl = coverImg ? coverImg.image_url : (env.cover_image_url || '');
        var photoCount = images.length;

        var card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML =
          (coverUrl ? '<img class="item-card-img" src="' + coverUrl + '" alt="' + env.name + '" onerror="this.style.display=\'none\'">' : '<div class="item-card-img-placeholder">Sem foto</div>') +
          '<div class="item-card-info">' +
            '<h4>' + env.name + '</h4>' +
            '<p>' +
              (env.show_on_home ? '<span class="badge badge-green">Na Home</span>' : '<span class="badge badge-gray">Oculto</span>') +
              ' &bull; ' + photoCount + ' foto' + (photoCount !== 1 ? 's' : '') +
            '</p>' +
          '</div>' +
          '<div class="item-card-actions">' +
            '<button class="btn btn-primary btn-sm" data-photos-env="' + env.id + '">Fotos</button>' +
            '<button class="btn btn-secondary btn-sm" data-edit-env="' + env.id + '">Editar</button>' +
            '<button class="btn btn-danger btn-sm" data-del-env="' + env.id + '">Excluir</button>' +
          '</div>';
        list.appendChild(card);
      });

      // Bind actions
      list.querySelectorAll('[data-edit-env]').forEach(function (btn) {
        btn.addEventListener('click', function () { editEnvironment(this.dataset.editEnv); });
      });
      list.querySelectorAll('[data-del-env]').forEach(function (btn) {
        btn.addEventListener('click', function () { deleteEnvironment(this.dataset.delEnv); });
      });
      list.querySelectorAll('[data-photos-env]').forEach(function (btn) {
        btn.addEventListener('click', function () { openPhotosModal(this.dataset.photosEnv); });
      });
    } catch (err) {
      console.error('Environments load error:', err);
      list.innerHTML = '<p style="color:#e74c3c;text-align:center;padding:2rem">Erro ao carregar ambientes.</p>';
    }
  }

  // New environment
  document.getElementById('btnNewEnv').addEventListener('click', function () {
    document.getElementById('envId').value = '';
    document.getElementById('envName').value = '';
    document.getElementById('envDescription').value = '';
    document.getElementById('envShowHome').checked = true;
    document.getElementById('modalEnvTitle').textContent = 'Novo Ambiente';
    openModal('modalEnv');
  });

  // Edit environment
  async function editEnvironment(id) {
    try {
      var { data } = await supabase.from('environments').select('*').eq('id', id).single();
      if (!data) return;

      document.getElementById('envId').value = data.id;
      document.getElementById('envName').value = data.name;
      document.getElementById('envDescription').value = data.description || '';
      document.getElementById('envShowHome').checked = data.show_on_home;

      document.getElementById('modalEnvTitle').textContent = 'Editar Ambiente';
      openModal('modalEnv');
    } catch (err) {
      toast('Erro ao carregar ambiente', 'error');
    }
  }

  // Save environment
  document.getElementById('envForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    var btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
      var id = document.getElementById('envId').value;
      var envName = document.getElementById('envName').value;
      var envData = {
        name: envName,
        description: document.getElementById('envDescription').value,
        show_on_home: document.getElementById('envShowHome').checked,
        slug: envName.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      };

      if (id) {
        await supabase.from('environments').update(envData).eq('id', id);
      } else {
        var { data: newEnv } = await supabase.from('environments').insert(envData).select().single();
        id = newEnv.id;
      }

      closeModal('modalEnv');
      toast('Ambiente salvo com sucesso!');
      loadEnvironments();

      // If new, open photos modal right away
      if (!document.getElementById('envId').value) {
        // Small delay so the list reloads first
        setTimeout(function () { openPhotosModal(id); }, 500);
      }
    } catch (err) {
      console.error('Environment save error:', err);
      toast('Erro ao salvar ambiente', 'error');
    }

    btn.disabled = false;
    btn.textContent = 'Salvar';
  });

  // Delete environment
  async function deleteEnvironment(id) {
    if (!confirm('Tem certeza que deseja excluir este ambiente e todas as suas fotos?')) return;

    try {
      // environment_images will be deleted by CASCADE
      await supabase.from('environments').delete().eq('id', id);

      toast('Ambiente excluído com sucesso!');
      loadEnvironments();
    } catch (err) {
      toast('Erro ao excluir ambiente', 'error');
    }
  }

  // ========================================
  // ENVIRONMENT PHOTOS MODAL
  // ========================================
  async function openPhotosModal(envId) {
    document.getElementById('envPhotosId').value = envId;

    // Get environment name for title
    var { data: env } = await supabase.from('environments').select('name').eq('id', envId).single();
    document.getElementById('modalEnvPhotosTitle').textContent = 'Fotos - ' + (env ? env.name : 'Ambiente');

    // Reset upload input
    document.querySelector('#uploadEnvImages input[type="file"]').value = '';
    document.getElementById('uploadProgress').style.display = 'none';

    await loadEnvPhotos(envId);
    openModal('modalEnvPhotos');
  }

  // Load photos into gallery
  async function loadEnvPhotos(envId) {
    var gallery = document.getElementById('envPhotoGallery');
    gallery.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
      var { data: images, error } = await supabase
        .from('environment_images')
        .select('*')
        .eq('environment_id', envId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!images || images.length === 0) {
        gallery.innerHTML = '<p class="no-photos">Nenhuma foto ainda. Use o botão acima para enviar fotos.</p>';
        return;
      }

      gallery.innerHTML = '';
      images.forEach(function (img) {
        var item = document.createElement('div');
        item.className = 'photo-card' + (img.is_cover ? ' is-cover' : '');
        item.innerHTML =
          '<img src="' + img.image_url + '" alt="Foto">' +
          '<div class="photo-actions">' +
            '<button type="button" class="photo-btn photo-btn-cover' + (img.is_cover ? ' active' : '') + '" data-cover-id="' + img.id + '" title="Definir como capa">' +
              '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' +
            '</button>' +
            '<button type="button" class="photo-btn photo-btn-delete" data-del-id="' + img.id + '" title="Remover foto">' +
              '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>' +
            '</button>' +
          '</div>' +
          (img.is_cover ? '<span class="cover-badge">CAPA</span>' : '');
        gallery.appendChild(item);
      });

      // Bind cover buttons
      gallery.querySelectorAll('[data-cover-id]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          setCoverPhoto(envId, this.dataset.coverId);
        });
      });

      // Bind delete buttons
      gallery.querySelectorAll('[data-del-id]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          deleteEnvPhoto(envId, this.dataset.delId);
        });
      });
    } catch (err) {
      console.error('Photos load error:', err);
      gallery.innerHTML = '<p style="color:#e74c3c">Erro ao carregar fotos.</p>';
    }
  }

  // Upload photos
  var uploadInput = document.querySelector('#uploadEnvImages input[type="file"]');
  uploadInput.addEventListener('change', async function () {
    var files = this.files;
    if (!files || files.length === 0) return;

    var envId = document.getElementById('envPhotosId').value;
    if (!envId) return;

    var progress = document.getElementById('uploadProgress');
    var progressFill = document.getElementById('progressFill');
    var progressText = document.getElementById('progressText');

    progress.style.display = 'block';
    var total = files.length;

    for (var i = 0; i < total; i++) {
      progressText.textContent = 'Enviando foto ' + (i + 1) + ' de ' + total + '...';
      progressFill.style.width = Math.round(((i) / total) * 100) + '%';

      try {
        var url = await uploadFile(files[i], 'site-assets', 'environments');

        // Check if this is the first image - make it cover automatically
        var { count } = await supabase
          .from('environment_images')
          .select('*', { count: 'exact', head: true })
          .eq('environment_id', envId);

        var isCover = (count === 0);

        await supabase.from('environment_images').insert({
          environment_id: envId,
          image_url: url,
          is_cover: isCover
        });

        // Update cover_image_url on environments table if this is cover
        if (isCover) {
          await supabase.from('environments').update({ cover_image_url: url }).eq('id', envId);
        }
      } catch (err) {
        console.error('Upload error:', err);
        toast('Erro ao enviar foto ' + (i + 1), 'error');
      }
    }

    progressFill.style.width = '100%';
    progressText.textContent = 'Concluído!';

    setTimeout(function () {
      progress.style.display = 'none';
      progressFill.style.width = '0%';
    }, 1000);

    this.value = '';
    toast(total + ' foto' + (total > 1 ? 's enviada' + 's' : ' enviada') + ' com sucesso!');
    await loadEnvPhotos(envId);
  });

  // Set cover photo
  async function setCoverPhoto(envId, imageId) {
    try {
      // Remove cover from all images of this environment
      await supabase
        .from('environment_images')
        .update({ is_cover: false })
        .eq('environment_id', envId);

      // Set new cover
      await supabase
        .from('environment_images')
        .update({ is_cover: true })
        .eq('id', imageId);

      // Get the image URL to update environments table
      var { data: img } = await supabase.from('environment_images').select('image_url').eq('id', imageId).single();
      if (img) {
        await supabase.from('environments').update({ cover_image_url: img.image_url }).eq('id', envId);
      }

      toast('Foto de capa atualizada!');
      await loadEnvPhotos(envId);
    } catch (err) {
      console.error('Set cover error:', err);
      toast('Erro ao definir capa', 'error');
    }
  }

  // Delete photo
  async function deleteEnvPhoto(envId, imageId) {
    if (!confirm('Remover esta foto?')) return;

    try {
      // Check if it was the cover
      var { data: img } = await supabase.from('environment_images').select('is_cover').eq('id', imageId).single();
      var wasCover = img && img.is_cover;

      await supabase.from('environment_images').delete().eq('id', imageId);

      // If we deleted the cover, promote the first remaining image
      if (wasCover) {
        var { data: remaining } = await supabase
          .from('environment_images')
          .select('id, image_url')
          .eq('environment_id', envId)
          .order('created_at', { ascending: true })
          .limit(1);

        if (remaining && remaining.length > 0) {
          await supabase.from('environment_images').update({ is_cover: true }).eq('id', remaining[0].id);
          await supabase.from('environments').update({ cover_image_url: remaining[0].image_url }).eq('id', envId);
        } else {
          await supabase.from('environments').update({ cover_image_url: null }).eq('id', envId);
        }
      }

      toast('Foto removida!');
      await loadEnvPhotos(envId);
    } catch (err) {
      toast('Erro ao remover foto', 'error');
    }
  }

  // ========================================
  // INIT
  // ========================================
  loadDashboard();
})();
