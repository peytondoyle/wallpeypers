'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function SuggestModal({ onClose }: { onClose: () => void }) {
  const [inputValue, setInputValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    // Step 1: Save to Supabase
    const { error: insertError } = await supabase
      .from('suggestions')
      .insert({ suggestion: inputValue });

    if (insertError) {
      console.error('Error submitting suggestion:', insertError.message);
      setError('There was an issue saving your suggestion.');
      return;
    }

    // Step 2: Send email via your own Next.js API route
    const res = await fetch('/api/send-suggestion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suggestion: inputValue }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.error('Error triggering email:', data.error || 'Unknown error');
      setError('Your suggestion was saved, but we had trouble sending a notification.');
      return;
    }

    // Step 3: Success
    setSubmitted(true);
    setTimeout(() => {
      setInputValue('');
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Suggest a Wallpaper Idea</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-xl">
            ×
          </button>
        </div>

        {!submitted ? (
          <>
            <textarea
              placeholder="Describe your idea..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-black resize-none"
              rows={4}
            />
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            <button
              onClick={handleSubmit}
              className="bg-black text-white rounded-full px-4 py-2 hover:bg-gray-900 text-sm w-full"
            >
              Submit
            </button>
          </>
        ) : (
          <div className="text-left text-green-600 font-medium">Thanks for your idea!</div>
        )}
      </div>
    </div>
  );
}