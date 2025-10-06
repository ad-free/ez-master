import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  AttachMoney,
  Download,
  CalendarToday,
  Description,
  CheckCircle,
  Error,
} from '@mui/icons-material';

interface SalaryDownloadProps {
  onDownload: (date?: string) => Promise<void>;
  isLoading: boolean;
}

const SalaryDownload: React.FC<SalaryDownloadProps> = ({ onDownload, isLoading }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadHistory, setDownloadHistory] = useState<string[]>([]);

  const handleDownload = async () => {
    try {
      setErrorMessage('');
      const dateString = selectedDate ? selectedDate.toISOString().slice(0, 7) : undefined;
      await onDownload(dateString);
      
      const displayDate = dateString || 'Current Month';
      setSuccessMessage(`Salary PDF for ${displayDate} downloaded successfully!`);
      setDownloadHistory(prev => [displayDate, ...prev.slice(0, 4)]); // Keep last 5 downloads
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to download salary PDF');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  };

  const getLastMonths = () => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date);
    }
    return months;
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const formatDateForAPI = (date: Date) => {
    return date.toISOString().slice(0, 7); // YYYY-MM format
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AttachMoney sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="h2">
              Salary Management
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Download your salary PDFs for any month. Select a specific month or download the current month's salary.
          </Typography>

          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircle />}>
              {successMessage}
            </Alert>
          )}

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }} icon={<Error />}>
              {errorMessage}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Quick Download Options */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Quick Download
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={() => onDownload()}
                  disabled={isLoading}
                  sx={{ minWidth: 200 }}
                >
                  {isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    'Current Month'
                  )}
                </Button>
                <Chip
                  icon={<CalendarToday />}
                  label={formatDateForDisplay(getCurrentMonth())}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Custom Date Selection */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Select Specific Month
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Select Month"
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                views={['year', 'month']}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    disabled: isLoading,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleDownload}
                disabled={isLoading || !selectedDate}
                fullWidth
                sx={{ height: '56px' }}
              >
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'Download Selected Month'
                )}
              </Button>
            </Grid>

            {/* Recent Downloads */}
            {downloadHistory.length > 0 && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Recent Downloads
                  </Typography>
                  <Paper elevation={1} sx={{ bgcolor: 'grey.50' }}>
                    <List dense>
                      {downloadHistory.map((month, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Description color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={`Salary - ${month}`}
                            secondary={`Downloaded ${index === 0 ? 'just now' : `${index} ago`}`}
                          />
                          <IconButton
                            edge="end"
                            onClick={() => {
                              // Re-download logic could go here
                              console.log(`Re-downloading ${month}`);
                            }}
                            disabled={isLoading}
                          >
                            <Download />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </>
            )}

            {/* Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                <Typography variant="body2">
                  <strong>Note:</strong> Salary PDFs are generated in real-time from your EZ account. 
                  Make sure you have the necessary permissions to access salary information. 
                  Downloads are available for the last 12 months.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default SalaryDownload;
