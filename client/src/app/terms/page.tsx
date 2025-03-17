import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Conditions d'utilisation
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Dernière mise à jour : {new Date().toLocaleDateString()}
              </p>
            </div>
            <Link
              href="/"
              className="btn-secondary flex items-center"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Retour
            </Link>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-5 sm:p-6 prose dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                1. Acceptation des conditions
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                En accédant ou en utilisant MessengerClone, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser notre service.
              </p>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                2. Description du service
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                MessengerClone est une application de messagerie instantanée qui permet aux utilisateurs de communiquer entre eux via des messages texte, des images et d'autres médias. Le service est fourni "tel quel" et peut être modifié à tout moment.
              </p>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                3. Comptes utilisateurs
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Pour utiliser certaines fonctionnalités de MessengerClone, vous devez créer un compte. Vous êtes responsable de maintenir la confidentialité de vos informations de compte et de toutes les activités qui se produisent sous votre compte.
              </p>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                4. Contenu de l'utilisateur
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Vous êtes seul responsable du contenu que vous publiez, envoyez ou affichez sur ou via le service. Vous ne pouvez pas publier de contenu qui viole les droits d'autrui, qui est illégal, offensant, menaçant, abusif, diffamatoire, ou qui contient des virus ou d'autres logiciels malveillants.
              </p>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                5. Propriété intellectuelle
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                MessengerClone et son contenu original, ses fonctionnalités et ses fonctionnalités sont et resteront la propriété exclusive de MessengerClone et de ses concédants. Le service est protégé par le droit d'auteur, les marques de commerce et d'autres lois.
              </p>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                6. Résiliation
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Nous nous réservons le droit de résilier ou de suspendre votre compte et votre accès au service immédiatement, sans préavis ni responsabilité, pour quelque raison que ce soit, y compris, sans limitation, si vous violez les conditions d'utilisation.
              </p>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                7. Limitation de responsabilité
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                En aucun cas, MessengerClone, ses administrateurs, employés ou agents ne seront responsables de tout dommage direct, indirect, accessoire, spécial, consécutif ou punitif résultant de l'utilisation ou de l'incapacité d'utiliser le service.
              </p>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                8. Modifications des conditions
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Nous nous réservons le droit, à notre seule discrétion, de modifier ou de remplacer ces conditions à tout moment. Si une révision est importante, nous fournirons un préavis de 30 jours avant que les nouvelles conditions ne prennent effet.
              </p>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                9. Loi applicable
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Ces conditions sont régies et interprétées conformément aux lois françaises, sans égard aux principes de conflits de lois.
              </p>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                10. Contact
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Si vous avez des questions concernant ces conditions, veuillez nous contacter à l'adresse suivante : contact@messengerclone.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 