import React, { useState } from 'react';
import axios from 'axios';
import { Save, X } from 'lucide-react';

const ToolForm = ({ tool, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: tool?.name || '',
    description: tool?.description || '',
    category: tool?.category || '',
    lifeLimit: tool?.lifeLimit || 100,
    thresholdLimit: tool?.thresholdLimit || 10,
    stock: tool?.stock || 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Submitting:', formData); // <-- Add this line
      if (tool) {
        await axios.put(`https://toolsmanagement.onrender.com/api/tools/${tool._id}`, formData);
      } else {
        await axios.post('https://toolsmanagement.onrender.com/api/tools', formData);
      }
      onSubmit();
    } catch (error) {
      console.log('Backend error:', error.response?.data); // Already present
      if (error.response?.data?.errors) {
        // Log the full errors array for debugging
        console.log('Validation errors:', error.response.data.errors);
        setError(
          error.response.data.errors
            .map(e =>
              e.msg || e.message || e.error || JSON.stringify(e)
            )
            .join(', ')
        );
      } else {
        setError(error.response?.data?.message || 'Failed to save tool');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Limit') || name === 'stock' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {tool ? 'Edit Tool' : 'Add New Tool'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tool Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select Category</option>
            <option value="drill">Drill Bits</option>
            <option value="mill">Milling Cutters</option>
            <option value="lathe">Lathe Tools</option>
            <option value="saw">Saw Blades</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Life Limit (hours)
            </label>
            <input
              type="number"
              name="lifeLimit"
              value={formData.lifeLimit}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Threshold Limit (hours)
            </label>
            <input
              type="number"
              name="thresholdLimit"
              value={formData.thresholdLimit}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Initial Stock
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {tool ? 'Update Tool' : 'Add Tool'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ToolForm;