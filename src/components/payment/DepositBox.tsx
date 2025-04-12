import { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { CreditCard, Wallet, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface DepositBoxProps {
  onClose?: () => void;
  onSuccess?: (amount: number) => void;
}

const DepositBox = ({ onClose, onSuccess }: DepositBoxProps) => {
  const { paymentMethods, deposit, userBalance } = usePayment();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [amount, setAmount] = useState<string>('');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Find default payment method
  const defaultMethod = paymentMethods.find(m => m.isDefault);

  // Set default payment method if available
  useState(() => {
    if (defaultMethod && !selectedMethodId) {
      setSelectedMethodId(defaultMethod.id);
    }
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    if (value.split('.').length > 2) return;

    // Limit to 2 decimal places
    const parts = value.split('.');
    if (parts[1] && parts[1].length > 2) return;

    setAmount(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate amount
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        setError(t('invalid_amount'));
        return;
      }

      // Validate payment method
      if (!selectedMethodId && paymentMethods.length > 0) {
        setError(t('select_payment_method'));
        return;
      }

      setIsProcessing(true);

      // Process deposit
      await deposit(numAmount, selectedMethodId);

      setSuccess(true);
      if (onSuccess) onSuccess(numAmount);

      // Reset form after success
      setTimeout(() => {
        setAmount('');
        setSuccess(false);
        if (onClose) onClose();
      }, 2000);

    } catch (error: any) {
      setError(error.message || t('deposit_error'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-workit-dark-card' : 'bg-white'} rounded-lg p-6 shadow-lg border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          {t('deposit_funds')}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            &times;
          </button>
        )}
      </div>

      {/* Current balance display */}
      <div className={`mb-6 p-4 rounded-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} flex items-center`}>
        <Wallet className={`mr-3 ${theme === 'dark' ? 'text-workit-purple' : 'text-workit-purple-dark'}`} size={24} />
        <div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('current_balance')}</p>
          <p className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {userBalance?.balance.toFixed(2) || '0.00'} {userBalance?.currency || 'TND'}
          </p>
        </div>
      </div>

      {success ? (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 flex items-center justify-center bg-green-100 text-green-500 rounded-full mb-4">
            <Check size={32} />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {t('deposit_success')}
          </h3>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {parseFloat(amount).toFixed(2)} {userBalance?.currency || 'TND'} {t('added_to_balance')}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-md flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Amount input */}
          <div className="mb-4">
            <label htmlFor="amount" className={`block mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('amount')}
            </label>
            <div className="relative">
              <input
                type="text"
                id="amount"
                className={`w-full p-3 pl-12 rounded-md ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-workit-purple`}
                placeholder="0.00"
                value={amount}
                onChange={handleAmountChange}
                disabled={isProcessing}
                required
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {userBalance?.currency || 'TND'}
              </div>
            </div>
          </div>

          {/* Payment method selection */}
          {paymentMethods.length > 0 && (
            <div className="mb-6">
              <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('payment_method')}
              </label>
              <div className="space-y-2">
                {paymentMethods.map(method => (
                  <div
                    key={method.id}
                    className={`p-3 rounded-md border cursor-pointer transition-colors ${
                      selectedMethodId === method.id
                        ? `${theme === 'dark' ? 'border-workit-purple bg-workit-purple/10' : 'border-workit-purple bg-workit-purple/5'}`
                        : `${theme === 'dark' ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`
                    }`}
                    onClick={() => setSelectedMethodId(method.id)}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center mr-3`}>
                        {method.type === 'credit_card' ? (
                          <CreditCard size={20} className="text-workit-purple" />
                        ) : (
                          <div className="text-blue-400 font-bold">{method.type === 'paypal' ? 'P' : '$'}</div>
                        )}
                      </div>
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {method.name}
                        </p>
                        {method.type === 'credit_card' && method.last4 && (
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            ••••{method.last4}
                          </p>
                        )}
                      </div>
                      {selectedMethodId === method.id && (
                        <div className="ml-auto">
                          <div className={`w-6 h-6 rounded-full ${theme === 'dark' ? 'bg-workit-purple' : 'bg-workit-purple'} flex items-center justify-center`}>
                            <Check size={14} className="text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className={`w-full py-3 rounded-md bg-workit-purple text-white font-medium hover:bg-workit-purple-light transition flex items-center justify-center ${
              isProcessing ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            disabled={isProcessing || !amount || parseFloat(amount) <= 0}
          >
            {isProcessing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('processing')}
              </span>
            ) : (
              <span className="flex items-center">
                {t('deposit_now')} <ArrowRight size={18} className="ml-2" />
              </span>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default DepositBox;
