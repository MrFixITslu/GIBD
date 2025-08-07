import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ROUTES } from '../constants';

const RegisterBusinessCTA: React.FC = () => {
    const { t } = useAppContext();

    return (
        <div className="bg-tropical-green-dark text-white rounded-lg shadow-xl p-8 my-12 text-center">
            <h2 className="text-3xl font-bold mb-2">{t('registerYourBusiness')}</h2>
            <p className="text-tropical-green-light text-lg mb-6 max-w-2xl mx-auto">{t('growWithUs')}</p>
            <Link
                to={ROUTES.REGISTER_BUSINESS}
                className="inline-block bg-sunset-orange text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-opacity-90 transition-transform transform hover:scale-105"
            >
                {t('getStarted')}
            </Link>
        </div>
    );
};

export default RegisterBusinessCTA;
