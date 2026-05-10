'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Save, CheckCircle } from 'lucide-react'

interface SettingField {
  key: string
  label: string
  placeholder?: string
  type?: string
}

const settingGroups: { title: string; group: string; fields: SettingField[] }[] = [
  {
    title: 'General',
    group: 'general',
    fields: [
      { key: 'site_name', label: 'Site Name', placeholder: 'Matin Sanitary' },
      { key: 'site_tagline', label: 'Tagline', placeholder: 'Premium Sanitary Solutions' },
      { key: 'site_email', label: 'Contact Email', type: 'email' },
      { key: 'site_phone', label: 'Phone Number', placeholder: '+92-42-...' },
      { key: 'site_address', label: 'Address', placeholder: 'Street, City, Country' },
      { key: 'currency', label: 'Currency Code', placeholder: 'BDT' },
      { key: 'currency_symbol', label: 'Currency Symbol', placeholder: '৳' },
    ],
  },
  {
    title: 'Shipping',
    group: 'shipping',
    fields: [
      { key: 'shipping_cost', label: 'Default Shipping Cost (৳)', type: 'number' },
      { key: 'free_shipping_threshold', label: 'Free Shipping Above (৳)', type: 'number' },
    ],
  },
  {
    title: 'Social Media',
    group: 'social',
    fields: [
      { key: 'facebook_url', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
      { key: 'instagram_url', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
      { key: 'whatsapp_number', label: 'WhatsApp Number', placeholder: '+92300...' },
    ],
  },
]

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        const map: Record<string, string> = {}
        d.data?.forEach((s: any) => { map[s.key] = s.value })
        setValues(map)
      })
  }, [])

  async function handleSave(group: string, fields: SettingField[]) {
    setLoading(true)
    try {
      const settings = fields.map((f) => ({ key: f.key, value: values[f.key] || '', group }))
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      if (!res.ok) throw new Error()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      alert('Error saving settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your store settings</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
          <CheckCircle size={16} />
          Settings saved successfully!
        </div>
      )}

      {settingGroups.map((group) => (
        <Card key={group.group}>
          <CardHeader>
            <CardTitle>{group.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {group.fields.map((field) => (
              <Input
                key={field.key}
                id={field.key}
                label={field.label}
                type={field.type || 'text'}
                placeholder={field.placeholder}
                value={values[field.key] || ''}
                onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
              />
            ))}
            <div className="pt-2 flex justify-end">
              <Button
                onClick={() => handleSave(group.group, group.fields)}
                loading={loading}
                size="sm"
              >
                <Save size={14} />
                Save {group.title}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
