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
  Paper,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Schedule, AccessTime, Today } from '@mui/icons-material';
import { format, parse } from 'date-fns';
import type { RegisterOTRequest } from '../types/api';

interface OTFormProps {
  onSubmit: (data: RegisterOTRequest) => Promise<void>;
  isLoading: boolean;
}

const OTRegistrationForm: React.FC<OTFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<RegisterOTRequest>({
    from_date: '',
    to_date: '',
    from_time: '',
    to_time: '',
    ot_type: 'PLAN',
    ot_benefit_type: 'DILIGENCE',
    reason: '',
  });
  const [errors, setErrors] = useState<Partial<RegisterOTRequest>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (field: keyof RegisterOTRequest) => (event: any) => {
    const value = event.target ? event.target.value : event;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterOTRequest> = {};
    if (!formData.from_date) newErrors.from_date = 'Required';
    if (!formData.to_date) newErrors.to_date = 'Required';
    if (formData.from_date && formData.to_date && formData.from_date > formData.to_date)
      newErrors.to_date = 'Must be after start date';
    if (!formData.from_time) newErrors.from_time = 'Required';
    if (!formData.to_time) newErrors.to_time = 'Required';
    if (formData.from_time && formData.to_time && formData.from_time >= formData.to_time)
      newErrors.to_time = 'Must be after start time';
    if (!formData.reason.trim()) newErrors.reason = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await onSubmit(formData);
      setSuccessMessage('OT registration submitted successfully!');
      setFormData({
        from_date: '', to_date: '', from_time: '', to_time: '',
        ot_type: 'PLAN', ot_benefit_type: 'DILIGENCE', reason: '',
      });
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      // Handled in parent
    }
  };

  const duration = (() => {
    if (!formData.from_time || !formData.to_time) return null;
    const [fh, fm] = formData.from_time.split(':').map(Number);
    const [th, tm] = formData.to_time.split(':').map(Number);
    const mins = th * 60 + tm - (fh * 60 + fm);
    if (mins <= 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return { hours: h, minutes: m, label: `${h}h ${m}m` };
  })();

  const fieldProps = (field: keyof RegisterOTRequest) => ({
    size: 'small' as const,
    fullWidth: true,
    error: !!errors[field],
    helperText: errors[field],
    disabled: isLoading,
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
          <Schedule color="secondary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Overtime Registration
          </Typography>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Time Period */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime fontSize="small" color="action" />
                Time Period
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 500 }}>
                    Start
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <DatePicker
                      label="Date"
                      value={formData.from_date ? parse(formData.from_date, 'yyyy-MM-dd', new Date()) : null}
                      onChange={(date) => handleInputChange('from_date')(date ? format(date, 'yyyy-MM-dd') : '')}
                      slotProps={{ textField: fieldProps('from_date') }}
                    />
                    <TimePicker
                      label="Time"
                      value={formData.from_time ? new Date(`2000-01-01T${formData.from_time}`) : null}
                      onChange={(time) => handleInputChange('from_time')(time ? time.toTimeString().slice(0, 5) : '')}
                      slotProps={{ textField: fieldProps('from_time') }}
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 500 }}>
                    End
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <DatePicker
                      label="Date"
                      value={formData.to_date ? parse(formData.to_date, 'yyyy-MM-dd', new Date()) : null}
                      onChange={(date) => handleInputChange('to_date')(date ? format(date, 'yyyy-MM-dd') : '')}
                      slotProps={{ textField: fieldProps('to_date') }}
                    />
                    <TimePicker
                      label="Time"
                      value={formData.to_time ? new Date(`2000-01-01T${formData.to_time}`) : null}
                      onChange={(time) => handleInputChange('to_time')(time ? time.toTimeString().slice(0, 5) : '')}
                      slotProps={{ textField: fieldProps('to_time') }}
                    />
                  </Box>
                </Box>
              </Box>
              {duration && (
                <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center' }}>
                  <Box sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.5,
                    borderRadius: 2, bgcolor: 'secondary.main',
                    color: 'common.white',
                  }}>
                    <AccessTime sx={{ fontSize: 16 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {duration.label}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>

            {/* Configuration */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Today fontSize="small" color="action" />
                Configuration
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>OT Type</InputLabel>
                  <Select
                    value={formData.ot_type}
                    onChange={handleInputChange('ot_type')}
                    label="OT Type"
                    disabled={isLoading}
                  >
                    <MenuItem value="PLAN">Planned</MenuItem>
                    <MenuItem value="ADDITIONAL">Additional</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Benefit Type</InputLabel>
                  <Select
                    value={formData.ot_benefit_type}
                    onChange={handleInputChange('ot_benefit_type')}
                    label="Benefit Type"
                    disabled={isLoading}
                  >
                    <MenuItem value="DILIGENCE">Diligence</MenuItem>
                    <MenuItem value="COMPENSATION">Compensation</MenuItem>
                    <MenuItem value="SALARY">Salary</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Paper>

            {/* Reason */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule fontSize="small" color="action" />
                Reason
              </Typography>
              <TextField
                placeholder="Describe the reason for overtime..."
                value={formData.reason}
                onChange={handleInputChange('reason')}
                fullWidth
                multiline
                minRows={2}
                size="small"
                error={!!errors.reason}
                helperText={errors.reason}
                disabled={isLoading}
              />
            </Paper>

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{ minWidth: 180, height: 40 }}
              >
                {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Register OT'}
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </LocalizationProvider>
  );
};

export default OTRegistrationForm;
