import { Phone, Mail, MessageCircle, MapPin } from 'lucide-react';

const ContactInfo = ({ phone, email, whatsapp, address, className = "" }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {phone && (
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Phone size={14} className="mr-2" />
            {phone}
          </div>
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
              title="WhatsApp"
            >
              <MessageCircle size={16} />
            </a>
          )}
        </div>
      )}
      
      {email && (
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <Mail size={14} className="mr-2" />
          {email}
        </div>
      )}
      
      {address && (address.street || address.city) && (
        <div className="flex items-start text-sm text-gray-600 dark:text-gray-300">
          <MapPin size={14} className="mr-2 mt-0.5 flex-shrink-0" />
          <p>
            {address.street && `${address.street}, `}
            {address.city}
          </p>
        </div>
      )}
    </div>
  );
};

export default ContactInfo;