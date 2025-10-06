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
  Paper,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CalendarToday, Schedule, AccessTime } from '@mui/icons-material';

interface OTFormProps {
  onSubmit: (data: OTFormData) => Promise<void>;
  isLoading: boolean;
}

interface OTFormData {
  from_date: string;
  to_date: string;
  from_time: string;
  to_time: string;
  ot_type: 'PLAN' | 'ADDITIONAL';
  ot_benefit_type: 'DILIGENCE' | 'COMPENSATION' | 'SALARY';
  reason: string;
}

const OTRegistrationForm: React.FC<OTFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<OTFormData>({
    from_date: '',
    to_date: '',
    from_time: '',
    to_time: '',
    ot_type: 'PLAN',
    ot_benefit_type: 'DILIGENCE',
    reason: '',
  });
  const [errors, setErrors] = useState<Partial<OTFormData>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (field: keyof OTFormData) => (event: any) => {
    const value = event.target ? event.target.value : event;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<OTFormData> = {};

    if (!formData.from_date) {
      newErrors.from_date = 'Start date is required';
    }
    if (!formData.to_date) {
      newErrors.to_date = 'End date is required';
    }
    if (formData.from_date && formData.to_date && formData.from_date > formData.to_date) {
      newErrors.to_date = 'End date must be after start date';
    }
    if (!formData.from_time) {
      newErrors.from_time = 'Start time is required';
    }
    if (!formData.to_time) {
      newErrors.to_time = 'End time is required';
    }
    if (formData.from_time && formData.to_time && formData.from_time >= formData.to_time) {
      newErrors.to_time = 'End time must be after start time';
    }
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      setSuccessMessage('OT registration submitted successfully!');
      setFormData({
        from_date: '',
        to_date: '',
        from_time: '',
        to_time: '',
        ot_type: 'PLAN',
        ot_benefit_type: 'DILIGENCE',
        reason: '',
      });
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const calculateDuration = () => {
    if (formData.from_time && formData.to_time) {
      const [fromHour, fromMin] = formData.from_time.split(':').map(Number);
      const [toHour, toMin] = formData.to_time.split(':').map(Number);
      const fromMinutes = fromHour * 60 + fromMin;
      const toMinutes = toHour * 60 + toMin;
      const durationMinutes = toMinutes - fromMinutes;
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
    return '';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Schedule sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="h2">
              Overtime Registration
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Register overtime requests with specific time windows and benefit types. All dates will be processed automatically.
          </Typography>

          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gap: 3 }}>
              {/* Date Range */}
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Date Range
                </Typography>
              </Box>
              
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <DatePicker
                  label="Start Date"
                  value={formData.from_date ? new Date(formData.from_date) : null}
                  onChange={(date) => handleInputChange('from_date')(date?.toISOString().split('T')[0] || '')}
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
              
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <DatePicker
                  label="End Date"
                  value={formData.to_date ? new Date(formData.to_date) : null}
                  onChange={(date) => handleInputChange('to_date')(date?.toISOString().split('T')[0] || '')}
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

              {/* Time Range */}
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                  Time Window
                </Typography>
              </Box>
              
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <TimePicker
                  label="Start Time"
                  value={formData.from_time ? new Date(`2000-01-01T${formData.from_time}`) : null}
                  onChange={(time) => {
                    const timeString = time ? time.toTimeString().slice(0, 5) : '';
                    handleInputChange('from_time')(timeString);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.from_time,
                      helperText: errors.from_time,
                      disabled: isLoading,
                    },
                  }}
                />
              </Box>
              
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <TimePicker
                  label="End Time"
                  value={formData.to_time ? new Date(`2000-01-01T${formData.to_time}`) : null}
                  onChange={(time) => {
                    const timeString = time ? time.toTimeString().slice(0, 5) : '';
                    handleInputChange('to_time')(timeString);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.to_time,
                      helperText: errors.to_time,
                      disabled: isLoading,
                    },
                  }}
                />
              </Box>

              {/* OT Configuration */}
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                  OT Configuration
                </Typography>
              </Box>
              
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <FormControl fullWidth error={!!errors.ot_type}>
                  <InputLabel>OT Type</InputLabel>
                  <Select
                    value={formData.ot_type}
                    onChange={handleInputChange('ot_type')}
                    label="OT Type"
                    disabled={isLoading}
                  >
                    <MenuItem value="PLAN">Plan</MenuItem>
                    <MenuItem value="ADDITIONAL">Additional</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <FormControl fullWidth error={!!errors.ot_benefit_type}>
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

              {/* Reason */}
              <Box sx={{ gridColumn: 'span 12' }}>
                <TextField
                  fullWidth
                  label="Reason for Overtime"
                  multiline
                  rows={3}
                  value={formData.reason}
                  onChange={handleInputChange('reason')}
                  placeholder="Please provide a detailed reason for the overtime request..."
                  error={!!errors.reason}
                  helperText={errors.reason}
                  disabled={isLoading}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Summary */}
            <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                Registration Summary
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip
                  icon={<CalendarToday />}
                  label={`From: ${formData.from_date || 'Not selected'}`}
                  color={formData.from_date ? 'primary' : 'default'}
                  variant={formData.from_date ? 'filled' : 'outlined'}
                />
                <Chip
                  icon={<CalendarToday />}
                  label={`To: ${formData.to_date || 'Not selected'}`}
                  color={formData.to_date ? 'primary' : 'default'}
                  variant={formData.to_date ? 'filled' : 'outlined'}
                />
                <Chip
                  icon={<AccessTime />}
                  label={`${formData.from_time || '00:00'} - ${formData.to_time || '00:00'}`}
                  color={formData.from_time && formData.to_time ? 'secondary' : 'default'}
                  variant={formData.from_time && formData.to_time ? 'filled' : 'outlined'}
                />
                {calculateDuration() && (
                  <Chip
                    label={`Duration: ${calculateDuration()}`}
                    color="info"
                    variant="outlined"
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`Type: ${formData.ot_type}`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  label={`Benefit: ${formData.ot_benefit_type}`}
                  color="secondary"
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                  'Register OT'
                )}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default OTRegistrationForm;
