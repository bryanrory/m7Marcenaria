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
    environments: 'Ambientes',
    projects: 'Projetos'
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
    if (name === 'projects') loadProjects();
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

  // Setup upload preview
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
  setupUploadPreview('uploadEnvCover', 'previewEnvCover');

  // Preview para upload múltiplo de imagens do projeto
  (function () {
    var input = document.querySelector('#uploadProjImages input[type="file"]');
    if (input) {
      input.addEventListener('change', function () {
        var gallery = document.getElementById('projImageGallery');
        // Remove previews anteriores (não salvos)
        gallery.querySelectorAll('.preview-new').forEach(function (el) { el.remove(); });

        for (var i = 0; i < this.files.length; i++) {
          (function (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
              var item = document.createElement('div');
              item.className = 'image-gallery-item preview-new';
              item.innerHTML = '<img src="' + e.target.result + '" alt="Preview">';
              gallery.appendChild(item);
            };
            reader.readAsDataURL(file);
          })(this.files[i]);
        }
      });
    }
  })();

  // ========================================
  // DASHBOARD
  // ========================================
  async function loadDashboard() {
    try {
      var { count: envCount } = await supabase.from('environments').select('*', { count: 'exact', head: true });
      var { count: homeCount } = await supabase.from('environments').select('*', { count: 'exact', head: true }).eq('show_on_home', true);
      var { count: projCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
      var { count: imgCount } = await supabase.from('project_images').select('*', { count: 'exact', head: true });

      document.getElementById('statEnv').textContent = envCount || 0;
      document.getElementById('statHome').textContent = homeCount || 0;
      document.getElementById('statProj').textContent = projCount || 0;
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
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        list.innerHTML = '<p style="color:#555;text-align:center;padding:2rem">Nenhum ambiente cadastrado.</p>';
        return;
      }

      list.innerHTML = '';
      data.forEach(function (env) {
        var card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML =
          '<img class="item-card-img" src="' + (env.cover_image_url || '') + '" alt="' + env.name + '" onerror="this.style.display=\'none\'">' +
          '<div class="item-card-info">' +
            '<h4>' + env.name + '</h4>' +
            '<p>' + (env.show_on_home ? '<span class="badge badge-green">Na Home</span>' : '<span class="badge badge-gray">Oculto</span>') + '</p>' +
          '</div>' +
          '<div class="item-card-actions">' +
            '<button class="btn btn-secondary btn-sm" data-edit-env="' + env.id + '">Editar</button>' +
            '<button class="btn btn-danger btn-sm" data-del-env="' + env.id + '">Excluir</button>' +
          '</div>';
        list.appendChild(card);
      });

      // Bind edit/delete
      list.querySelectorAll('[data-edit-env]').forEach(function (btn) {
        btn.addEventListener('click', function () { editEnvironment(this.dataset.editEnv); });
      });
      list.querySelectorAll('[data-del-env]').forEach(function (btn) {
        btn.addEventListener('click', function () { deleteEnvironment(this.dataset.delEnv); });
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
    document.getElementById('previewEnvCover').style.display = 'none';
    document.querySelector('#uploadEnvCover input[type="file"]').value = '';
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
      document.querySelector('#uploadEnvCover input[type="file"]').value = '';

      var preview = document.getElementById('previewEnvCover');
      if (data.cover_image_url) {
        preview.src = data.cover_image_url;
        preview.style.display = 'block';
      } else {
        preview.style.display = 'none';
      }

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
      var envData = {
        name: document.getElementById('envName').value,
        description: document.getElementById('envDescription').value,
        show_on_home: document.getElementById('envShowHome').checked
      };

      var coverFile = document.querySelector('#uploadEnvCover input[type="file"]').files[0];
      if (coverFile) {
        envData.cover_image_url = await uploadFile(coverFile, 'site-assets', 'environments');
      }

      if (id) {
        await supabase.from('environments').update(envData).eq('id', id);
      } else {
        await supabase.from('environments').insert(envData);
      }

      closeModal('modalEnv');
      toast('Ambiente salvo com sucesso!');
      loadEnvironments();
    } catch (err) {
      console.error('Environment save error:', err);
      toast('Erro ao salvar ambiente', 'error');
    }

    btn.disabled = false;
    btn.textContent = 'Salvar';
  });

  // Delete environment
  async function deleteEnvironment(id) {
    if (!confirm('Tem certeza que deseja excluir este ambiente? Todos os projetos vinculados também serão excluídos.')) return;

    try {
      // Delete project images first
      var { data: projects } = await supabase.from('projects').select('id').eq('environment_id', id);
      if (projects && projects.length > 0) {
        var projIds = projects.map(function (p) { return p.id; });
        await supabase.from('project_images').delete().in('project_id', projIds);
        await supabase.from('projects').delete().eq('environment_id', id);
      }
      await supabase.from('environments').delete().eq('id', id);

      toast('Ambiente excluído com sucesso!');
      loadEnvironments();
    } catch (err) {
      toast('Erro ao excluir ambiente', 'error');
    }
  }

  // ========================================
  // PROJECTS
  // ========================================
  async function loadProjects() {
    var list = document.getElementById('projList');
    list.innerHTML = '<div class="loading"><div class="spinner"></div><p>Carregando...</p></div>';

    try {
      var { data, error } = await supabase
        .from('projects')
        .select('*, environments(name), project_images(id, image_url)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        list.innerHTML = '<p style="color:#555;text-align:center;padding:2rem">Nenhum projeto cadastrado.</p>';
        return;
      }

      list.innerHTML = '';
      data.forEach(function (proj) {
        var firstImg = proj.project_images && proj.project_images.length > 0 ? proj.project_images[0].image_url : '';
        var card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML =
          (firstImg ? '<img class="item-card-img" src="' + firstImg + '" alt="' + proj.title + '">' : '') +
          '<div class="item-card-info">' +
            '<h4>' + proj.title + '</h4>' +
            '<p>' + (proj.environments ? proj.environments.name : 'Sem ambiente') +
            ' &bull; ' + (proj.project_images ? proj.project_images.length : 0) + ' imagens</p>' +
          '</div>' +
          '<div class="item-card-actions">' +
            '<button class="btn btn-secondary btn-sm" data-edit-proj="' + proj.id + '">Editar</button>' +
            '<button class="btn btn-danger btn-sm" data-del-proj="' + proj.id + '">Excluir</button>' +
          '</div>';
        list.appendChild(card);
      });

      list.querySelectorAll('[data-edit-proj]').forEach(function (btn) {
        btn.addEventListener('click', function () { editProject(this.dataset.editProj); });
      });
      list.querySelectorAll('[data-del-proj]').forEach(function (btn) {
        btn.addEventListener('click', function () { deleteProject(this.dataset.delProj); });
      });
    } catch (err) {
      console.error('Projects load error:', err);
      list.innerHTML = '<p style="color:#e74c3c;text-align:center;padding:2rem">Erro ao carregar projetos.</p>';
    }
  }

  // Load environments for project select
  async function loadEnvSelect() {
    var select = document.getElementById('projEnvId');
    select.innerHTML = '<option value="">Selecione um ambiente</option>';

    var { data } = await supabase.from('environments').select('id, name').order('name');
    if (data) {
      data.forEach(function (env) {
        var opt = document.createElement('option');
        opt.value = env.id;
        opt.textContent = env.name;
        select.appendChild(opt);
      });
    }
  }

  // New project
  document.getElementById('btnNewProj').addEventListener('click', async function () {
    document.getElementById('projId').value = '';
    document.getElementById('projTitle').value = '';
    document.getElementById('projDesc').value = '';
    document.getElementById('projImageGallery').innerHTML = '';
    document.querySelector('#uploadProjImages input[type="file"]').value = '';
    document.getElementById('modalProjTitle').textContent = 'Novo Projeto';
    await loadEnvSelect();
    document.getElementById('projEnvId').value = '';
    openModal('modalProj');
  });

  // Edit project
  async function editProject(id) {
    try {
      var { data } = await supabase.from('projects').select('*, project_images(id, image_url)').eq('id', id).single();
      if (!data) return;

      document.getElementById('projId').value = data.id;
      document.getElementById('projTitle').value = data.title;
      document.getElementById('projDesc').value = data.description || '';
      document.querySelector('#uploadProjImages input[type="file"]').value = '';

      await loadEnvSelect();
      document.getElementById('projEnvId').value = data.environment_id;

      // Show existing images
      var gallery = document.getElementById('projImageGallery');
      gallery.innerHTML = '';
      if (data.project_images) {
        data.project_images.forEach(function (img) {
          var item = document.createElement('div');
          item.className = 'image-gallery-item';
          item.innerHTML =
            '<img src="' + img.image_url + '" alt="">' +
            '<button type="button" class="remove-img" data-img-id="' + img.id + '">X</button>';
          gallery.appendChild(item);
        });

        gallery.querySelectorAll('.remove-img').forEach(function (btn) {
          btn.addEventListener('click', function () { removeProjectImage(this.dataset.imgId, this.parentElement); });
        });
      }

      document.getElementById('modalProjTitle').textContent = 'Editar Projeto';
      openModal('modalProj');
    } catch (err) {
      toast('Erro ao carregar projeto', 'error');
    }
  }

  // Save project
  document.getElementById('projForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    var btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
      var id = document.getElementById('projId').value;
      var projData = {
        environment_id: document.getElementById('projEnvId').value,
        title: document.getElementById('projTitle').value,
        description: document.getElementById('projDesc').value
      };

      var projectId = id;

      if (id) {
        await supabase.from('projects').update(projData).eq('id', id);
      } else {
        var { data: newProj } = await supabase.from('projects').insert(projData).select().single();
        projectId = newProj.id;
      }

      // Upload new images
      var files = document.querySelector('#uploadProjImages input[type="file"]').files;
      for (var i = 0; i < files.length; i++) {
        var url = await uploadFile(files[i], 'site-assets', 'projects');
        await supabase.from('project_images').insert({ project_id: projectId, image_url: url });
      }

      closeModal('modalProj');
      toast('Projeto salvo com sucesso!');
      loadProjects();
    } catch (err) {
      console.error('Project save error:', err);
      toast('Erro ao salvar projeto', 'error');
    }

    btn.disabled = false;
    btn.textContent = 'Salvar';
  });

  // Delete project
  async function deleteProject(id) {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;

    try {
      await supabase.from('project_images').delete().eq('project_id', id);
      await supabase.from('projects').delete().eq('id', id);
      toast('Projeto excluído com sucesso!');
      loadProjects();
    } catch (err) {
      toast('Erro ao excluir projeto', 'error');
    }
  }

  // Remove single image
  async function removeProjectImage(imgId, element) {
    if (!confirm('Remover esta imagem?')) return;

    try {
      await supabase.from('project_images').delete().eq('id', imgId);
      element.remove();
      toast('Imagem removida!');
    } catch (err) {
      toast('Erro ao remover imagem', 'error');
    }
  }

  // ========================================
  // INIT
  // ========================================
  loadDashboard();
})();
