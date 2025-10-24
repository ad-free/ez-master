import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
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
  // added separate state for custom reason when "Other" is selected
  const [customReason, setCustomReason] = useState<string>('');
  const [errors, setErrors] = useState<Partial<WFHFormData>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (field: keyof WFHFormData) => (event: any) => {
    const value = event.target ? event.target.value : event;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
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

    // require customReason when Other is selected
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
      // Error handling is done in parent component
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
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Home sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="h2">
              Work From Home Registration
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Register your work from home requests for specific date ranges. All dates will be processed automatically.
          </Typography>

          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
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
                      // clear custom reason when switching away from Other
                      if (value !== 'Other') {
                        setCustomReason('');
                      }
                      if (errors.reason) {
                        setErrors(prev => ({ ...prev, reason: undefined }));
                      }
                    }}
                    label="Reason for WFH"
                    disabled={isLoading}
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
                  />
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  icon={<CalendarToday />}
                  label={`From: ${formData.from_date || 'Not selected'}`}
                  color={formData.from_date ? 'primary' : undefined}
                  variant={formData.from_date ? 'filled' : 'outlined'}
                />
                <Chip
                  icon={<CalendarToday />}
                  label={`To: ${formData.to_date || 'Not selected'}`}
                  color={formData.to_date ? 'primary' : undefined}
                  variant={formData.to_date ? 'filled' : 'outlined'}
                />
                <Chip
                  label={`Reason: ${formData.reason === 'Other' ? (customReason || 'Other') : formData.reason}`}
                />
              </Box>
              
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ minWidth: 120 }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Register WFH'
                )}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default WFHRegistrationForm;
