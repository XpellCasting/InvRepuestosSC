import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Barcode, Save, X, Plus, Trash2, Image as ImageIcon, Link as LinkIcon, Edit } from 'lucide-react';
import apiClient from '../api/axios';
import { useAlert } from '../context/AlertContext';

const AddProduct = () => {
  const { showAlert } = useAlert();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    codigo_barras: '',
    nombre: '',
    descripcion: '',
    componentes: '',
    precio: 0,
    stock: 0,
    distribuidor_id: '',
    imagen: []
  });
  const [compatibilidad, setCompatibilidad] = useState([]);
  const [distribuidores, setDistribuidores] = useState([]);
  const [imageMode, setImageMode] = useState('URL'); // 'URL' or 'Upload'
  const [tempUrl, setTempUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [newDistName, setNewDistName] = useState('');
  const [showNewDist, setShowNewDist] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [confirmDialog, setConfirmDialog] = useState(null);

  useEffect(() => {
    fetchDistribuidores();
    if (isEditing) {
      apiClient.get(`/productos/${id}`).then(res => {
        const p = res.data;
        let parsedImages = [];
        try {
          parsedImages = typeof p.imagen === 'string' && p.imagen.startsWith('[') ? JSON.parse(p.imagen) : (p.imagen ? [p.imagen] : []);
        } catch(e) { parsedImages = p.imagen ? [p.imagen] : []; }

        setForm({
          codigo_barras: p.codigo_barras || '',
          nombre: p.nombre || '',
          descripcion: p.descripcion || '',
          componentes: p.componentes || '',
          precio: p.precio || 0,
          stock: p.stock || 0,
          distribuidor_id: p.distribuidor_id || '',
          imagen: parsedImages
        });
        setCompatibilidad(p.compatibilidad || []);
      });
    } else {
      setForm({
        codigo_barras: '',
        nombre: '',
        descripcion: '',
        componentes: '',
        precio: 0,
        stock: 0,
        distribuidor_id: '',
        imagen: []
      });
      setCompatibilidad([]);
      setImageMode('URL');
      setTempUrl('');
      setErrors({});
      setFileInputKey(Date.now());
    }
  }, [id, isEditing]);

  const handleDelete = () => {
    setConfirmDialog({
      title: 'Eliminar Producto',
      message: '¿Estás seguro de que deseas eliminar este producto de forma permanente?',
      onConfirm: async () => {
        try {
          await apiClient.delete(`/productos/${id}`);
          showAlert('Producto eliminado correctamente', 'success');
          navigate('/buscar');
        } catch (e) {
          showAlert('Error al eliminar producto', 'error');
        }
      }
    });
  };

  const addImage = (imgStr) => {
    if (!imgStr) return;
    setForm(prev => ({...prev, imagen: [...prev.imagen, imgStr]}));
  };

  const removeImage = (idx) => {
    setForm(prev => ({...prev, imagen: prev.imagen.filter((_, i) => i !== idx)}));
  };

  const fetchDistribuidores = async () => {
    const res = await apiClient.get('/distribuidores');
    setDistribuidores(res.data);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.codigo_barras) newErrors.codigo_barras = "Requerido";
    if (!form.nombre) newErrors.nombre = "Requerido";
    if (form.precio < 0) newErrors.precio = "Debe ser >= 0";
    if (form.stock < 0) newErrors.stock = "Debe ser >= 0";
    if (!form.distribuidor_id && !showNewDist) newErrors.distribuidor_id = "Selecciona un distribuidor";
    if (showNewDist && !newDistName) newErrors.newDist = "Escribe el nombre del distribuidor";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      let d_id = form.distribuidor_id;
      if (showNewDist) {
        const dRes = await apiClient.post('/distribuidores', { nombre: newDistName });
        d_id = dRes.data.id;
      }

      const payload = { ...form, distribuidor_id: d_id, compatibilidad };

      if (isEditing) {
        await apiClient.put(`/productos/${id}`, payload);
        showAlert('Producto actualizado correctamente', 'success');
      } else {
        await apiClient.post(`/productos`, payload);
        showAlert('Producto añadido correctamente', 'success');
      }
      navigate('/buscar');
    } catch (err) {
      console.error(err);
      showAlert('Error al guardar el producto.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addCompatRow = () => {
    setCompatibilidad([...compatibilidad, { marca: '', modelo: '', anio_desde: '', anio_hasta: '', motor: '' }]);
  };

  const removeCompatRow = (idx) => {
    setCompatibilidad(compatibilidad.filter((_, i) => i !== idx));
  };

  const updateCompatRow = (idx, field, val) => {
    const newArr = [...compatibilidad];
    newArr[idx][field] = val;
    setCompatibilidad(newArr);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#003366]">
          {isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto'}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de Barras (SKU) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Barcode className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={form.codigo_barras}
                  onChange={e => setForm({...form, codigo_barras: e.target.value})}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.codigo_barras ? 'border-red-500 focus:ring-red-200' : 'border-[#D1D5DB] focus:ring-[#003366]'}`}
                />
              </div>
              {errors.codigo_barras && <p className="text-red-500 text-xs mt-1">{errors.codigo_barras}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={e => setForm({...form, nombre: e.target.value})}
                className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.nombre ? 'border-red-500 focus:ring-red-200' : 'border-[#D1D5DB] focus:ring-[#003366]'}`}
              />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                <input
                  type="number"
                  value={form.precio}
                  onChange={e => setForm({...form, precio: e.target.value})}
                  className="block w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#003366]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={e => setForm({...form, stock: e.target.value})}
                  className="block w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#003366]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distribuidor <span className="text-red-500">*</span>
              </label>
              <select
                value={showNewDist ? 'NEW' : form.distribuidor_id}
                onChange={e => {
                  if (e.target.value === 'NEW') setShowNewDist(true);
                  else { setShowNewDist(false); setForm({...form, distribuidor_id: e.target.value}); }
                }}
                className="block w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#003366]"
              >
                <option value="">-- Seleccionar --</option>
                {distribuidores.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                <option value="NEW">+ Nuevo Distribuidor</option>
              </select>
              {showNewDist && (
                <div className="mt-2 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Nombre del nuevo distribuidor" 
                    className="flex-1 px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-[#003366]"
                    value={newDistName}
                    onChange={e => setNewDistName(e.target.value)}
                  />
                  <button onClick={() => setShowNewDist(false)} className="text-gray-500 hover:text-red-500"><X/></button>
                </div>
              )}
              {errors.distribuidor_id && <p className="text-red-500 text-xs mt-1">{errors.distribuidor_id}</p>}
              {errors.newDist && <p className="text-red-500 text-xs mt-1">{errors.newDist}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                rows={3}
                value={form.descripcion}
                onChange={e => setForm({...form, descripcion: e.target.value})}
                className="block w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#003366]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Componentes (Separados por coma)</label>
              <textarea
                rows={2}
                value={form.componentes}
                onChange={e => setForm({...form, componentes: e.target.value})}
                className="block w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#003366]"
              />
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex gap-4 mb-3 border-b border-gray-200 pb-2">
                <button 
                  type="button"
                  onClick={() => setImageMode('URL')} 
                  className={`flex items-center gap-1 text-sm font-medium ${imageMode === 'URL' ? 'text-[#003366]' : 'text-gray-500'}`}
                >
                  <LinkIcon size={16}/> Enlace URL
                </button>
                <button 
                  type="button"
                  onClick={() => setImageMode('Upload')} 
                  className={`flex items-center gap-1 text-sm font-medium ${imageMode === 'Upload' ? 'text-[#003366]' : 'text-gray-500'}`}
                >
                  <ImageIcon size={16}/> Subir Imagen
                </button>
              </div>

              {imageMode === 'URL' ? (
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={tempUrl}
                    onChange={e => setTempUrl(e.target.value)}
                    className="block flex-1 px-3 py-2 border border-[#D1D5DB] rounded-lg focus:ring-[#003366]"
                  />
                  <button type="button" onClick={() => { addImage(tempUrl); setTempUrl(''); }} className="bg-[#1a6bcc] text-white px-3 py-2 rounded-lg hover:bg-blue-700">Agregar</button>
                </div>
              ) : (
                <div className="mb-3">
                  <input
                    key={fileInputKey}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          addImage(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                      setFileInputKey(Date.now()); // Re-render forces a brand new input instead of mutating .value
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#003366] file:text-white hover:file:bg-[#002244] cursor-pointer"
                  />
                </div>
              )}

              {form.imagen.length > 0 && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {form.imagen.map((imgUrl, idx) => (
                    <div key={idx} className="relative h-24 w-full bg-white rounded flex items-center justify-center border border-gray-200 overflow-hidden group">
                      <img src={imgUrl} alt="Preview" className="h-full object-contain" />
                      <button 
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compatibilidad Section */}
        <div className="mt-10 border-t border-gray-200 pt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[#333333]">Compatibilidad Vehicular</h3>
            <button 
              onClick={addCompatRow}
              className="flex items-center gap-1 bg-[#1a6bcc] text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700"
            >
              <Plus size={16}/> Agregar Vehículo
            </button>
          </div>
          
          {compatibilidad.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No hay compatibilidades definidas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-24">Desde</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-24">Hasta</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Motor</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-12"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {compatibilidad.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">
                        <input className="w-full px-2 py-1 border rounded text-sm" value={row.marca} onChange={e => updateCompatRow(idx, 'marca', e.target.value)} />
                      </td>
                      <td className="px-3 py-2">
                        <input className="w-full px-2 py-1 border rounded text-sm" value={row.modelo} onChange={e => updateCompatRow(idx, 'modelo', e.target.value)} />
                      </td>
                      <td className="px-3 py-2">
                        <input className="w-full px-2 py-1 border rounded text-sm" value={row.anio_desde} onChange={e => updateCompatRow(idx, 'anio_desde', e.target.value)} />
                      </td>
                      <td className="px-3 py-2">
                        <input className="w-full px-2 py-1 border rounded text-sm" value={row.anio_hasta} onChange={e => updateCompatRow(idx, 'anio_hasta', e.target.value)} />
                      </td>
                      <td className="px-3 py-2">
                        <input className="w-full px-2 py-1 border rounded text-sm" value={row.motor} onChange={e => updateCompatRow(idx, 'motor', e.target.value)} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => removeCompatRow(idx)} className="text-red-500 hover:text-red-700 mt-1"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4">
            <h3 className="text-red-800 font-bold mb-1">Errores en el formulario</h3>
            <p className="text-sm text-red-600">Por favor, corrige los campos marcados en rojo antes de guardar.</p>
          </div>
        )}

        <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 pt-6">
          {isEditing && (
            <button 
              onClick={handleDelete}
              className="mr-auto px-5 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 flex items-center gap-2 transition"
            >
              <Trash2 size={18} /> Eliminar
            </button>
          )}
          <button 
            onClick={() => navigate(-1)}
            className="px-5 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-white bg-[#003366] rounded-lg hover:bg-[#002244] disabled:opacity-50"
          >
            <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-fade-in-up">
            <h3 className="text-xl font-bold text-[#003366] mb-2">{confirmDialog.title}</h3>
            <p className="text-gray-600 mb-6">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;
