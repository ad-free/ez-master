import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  AttachMoney,
  Download,
  Info,
} from '@mui/icons-material';

interface SalaryDownloadProps {
  onDownload: (date?: string) => Promise<void>;
  isLoading: boolean;
}

const monthLabels = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const currentMonthStr = () => {
  const now = new Date();
  return `${monthLabels[now.getMonth()]} ${now.getFullYear()}`;
};

const SalaryDownload: React.FC<SalaryDownloadProps> = ({ onDownload, isLoading }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDownload = async (date?: string) => {
    await onDownload(date);
  };

  const handleCustomDownload = async () => {
    if (!selectedDate) return;
    const dateString = selectedDate.toISOString().slice(0, 7);
    await handleDownload(dateString);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <AttachMoney color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Salary History
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '0 1 240px' } }}>
                <DatePicker
                  label="Select month"
                  value={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  views={['year', 'month']}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      disabled: isLoading,
                    },
                  }}
                />
              </Box>
              <Button
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <Download />}
                onClick={handleCustomDownload}
                disabled={isLoading || !selectedDate}
                sx={{ height: 40, minWidth: 200 }}
              >
                {isLoading ? 'Downloading...' : 'Download'}
              </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                Or download
              </Typography>
              <Button
                variant="text"
                size="small"
                onClick={() => handleDownload()}
                disabled={isLoading}
                sx={{ textTransform: 'none', fontWeight: 600, minWidth: 0 }}
              >
                current month
              </Button>
              <Typography variant="body2" color="text.secondary">
                ({currentMonthStr()})
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start', mt: 1 }}>
              <Info sx={{ fontSize: 16, color: 'text.secondary', mt: 0.3 }} />
              <Typography variant="caption" color="text.secondary">
                Salary PDFs are generated in real-time. Downloads available for the last 12 months.
              </Typography>
            </Box>
          </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default SalaryDownload;
