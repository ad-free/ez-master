import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CalendarToday, Home } from '@mui/icons-material';
import { format, parse } from 'date-fns';

interface WFHFormProps {
  onSubmit: (data: WFHFormData) => Promise<void>;
  isLoading: boolean;
}

interface WFHFormData {
  from_date: string;
  to_date: string;
  reason: string;
}

const WFHRegistrationForm: React.FC<WFHFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<WFHFormData>({
    from_date: '',
    to_date: '',
    reason: 'WFH as planned',
  });
  const [customReason, setCustomReason] = useState<string>('');
  const [errors, setErrors] = useState<Partial<WFHFormData>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (field: keyof WFHFormData) => (event: any) => {
    const value = event.target ? event.target.value : event;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<WFHFormData> = {};

    if (!formData.from_date) {
      newErrors.from_date = 'Start date is required';
    }
    if (!formData.to_date) {
      newErrors.to_date = 'End date is required';
    }
    if (formData.from_date && formData.to_date && formData.from_date > formData.to_date) {
      newErrors.to_date = 'End date must be after start date';
    }

    if (formData.reason === 'Other') {
      if (!customReason.trim()) {
        newErrors.reason = 'Custom reason is required';
      }
    } else {
      if (!formData.reason.trim()) {
        newErrors.reason = 'Reason is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const payload: WFHFormData = {
      from_date: formData.from_date,
      to_date: formData.to_date,
      reason: formData.reason === 'Other' ? customReason.trim() : formData.reason,
    };

    try {
      await onSubmit(payload);
      setSuccessMessage('WFH registration submitted successfully!');
      setFormData({
        from_date: '',
        to_date: '',
        reason: 'WFH as planned',
      });
      setCustomReason('');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      // Error is handled in parent
    }
  };

  const predefinedReasons = [
    'WFH as planned',
    'Personal matters',
    'Health reasons',
    'Family emergency',
    'Weather conditions',
    'Other',
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.08)', color: 'primary.main', display: 'flex' }}>
            <Home />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Work From Home Registration
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Submit your work from home requests. Approved dates will process automatically.
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>
            {successMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <Box>
              <DatePicker
                label="Start Date"
                value={formData.from_date ? parse(formData.from_date, 'yyyy-MM-dd', new Date()) : null}
                onChange={(date) => handleInputChange('from_date')(date ? format(date as Date, 'yyyy-MM-dd') : '')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.from_date,
                    helperText: errors.from_date,
                    disabled: isLoading,
                    InputProps: { style: { borderRadius: 10 } },
                  },
                }}
              />
            </Box>
            
            <Box>
              <DatePicker
                label="End Date"
                value={formData.to_date ? parse(formData.to_date, 'yyyy-MM-dd', new Date()) : null}
                onChange={(date) => handleInputChange('to_date')(date ? format(date as Date, 'yyyy-MM-dd') : '')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.to_date,
                    helperText: errors.to_date,
                    disabled: isLoading,
                    InputProps: { style: { borderRadius: 10 } },
                  },
                }}
              />
            </Box>

            <Box sx={{ gridColumn: '1/-1' }}>
              <FormControl fullWidth error={!!errors.reason}>
                <InputLabel>Reason for WFH</InputLabel>
                <Select
                  value={formData.reason}
                  onChange={(e) => {
                    const value = e.target.value as string;
                    setFormData(prev => ({ ...prev, reason: value }));
                    if (value !== 'Other') {
                      setCustomReason('');
                    }
                    if (errors.reason) {
                      setErrors(prev => ({ ...prev, reason: undefined }));
                    }
                  }}
                  label="Reason for WFH"
                  disabled={isLoading}
                  sx={{ borderRadius: '10px' }}
                >
                  {predefinedReasons.map((reason) => (
                    <MenuItem key={reason} value={reason}>
                      {reason}
                    </MenuItem>
                  ))}
                </Select>
                {errors.reason && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.reason}
                  </Typography>
                )}
              </FormControl>
            </Box>

            {formData.reason === 'Other' && (
              <Box sx={{ gridColumn: '1/-1' }}>
                <TextField
                  fullWidth
                  label="Custom Reason"
                  multiline
                  rows={3}
                  value={customReason}
                  onChange={(e) => {
                    setCustomReason(e.target.value);
                    if (errors.reason) {
                      setErrors(prev => ({ ...prev, reason: undefined }));
                    }
                  }}
                  placeholder="Please specify your reason for working from home..."
                  disabled={isLoading}
                  error={!!errors.reason}
                  helperText={errors.reason}
                  slotProps={{
                    input: { style: { borderRadius: 10 } },
                  }}
                />
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<CalendarToday fontSize="small" />}
                label={formData.from_date ? `From: ${formData.from_date}` : 'Start: Not set'}
                color={formData.from_date ? 'primary' : 'default'}
                variant={formData.from_date ? 'filled' : 'outlined'}
                size="small"
                sx={{ borderRadius: 2 }}
              />
              <Chip
                icon={<CalendarToday fontSize="small" />}
                label={formData.to_date ? `To: ${formData.to_date}` : 'End: Not set'}
                color={formData.to_date ? 'primary' : 'default'}
                variant={formData.to_date ? 'filled' : 'outlined'}
                size="small"
                sx={{ borderRadius: 2 }}
              />
            </Box>
            
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                px: 4,
                borderRadius: 2.5,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(99, 102, 241, 0.3)',
                },
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Register WFH'}
            </Button>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default WFHRegistrationForm;
