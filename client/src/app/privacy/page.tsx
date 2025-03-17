import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Politique de confidentialité
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
                1. Introduction
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Chez MessengerClone, nous prenons la protection de vos données personnelles très au sérieux. Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos informations lorsque vous utilisez notre service.
              </p>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                2. Informations que nous collectons
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Nous collectons plusieurs types d'informations vous concernant, notamment :
              </p>
              <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
                <li className="mb-2">
                  <strong>Informations de compte</strong> : lorsque vous créez un compte, nous collectons votre nom, adresse e-mail, mot de passe et autres informations de profil.
                </li>
                <li className="mb-2">
                  <strong>Contenu des messages</strong> : nous stockons le contenu de vos messages pour vous permettre de les consulter et d'y répondre.
                </li>
                <li className="mb-2">
                  <strong>Informations d'utilisation</strong> : nous collectons des informations sur la façon dont vous utilisez notre service, comme les fonctionnalités que vous utilisez et le temps que vous passez sur l'application.
                </li>
                <li className="mb-2">
                  <strong>Informations sur l'appareil</strong> : nous collectons des informations sur l'appareil que vous utilisez pour accéder à notre service, comme le type d'appareil, le système d'exploitation et l'adresse IP.
                </li>
              </ul>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                3. Comment nous utilisons vos informations
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Nous utilisons vos informations pour :
              </p>
              <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
                <li className="mb-2">Fournir, maintenir et améliorer notre service</li>
                <li className="mb-2">Vous permettre de communiquer avec d'autres utilisateurs</li>
                <li className="mb-2">Personnaliser votre expérience</li>
                <li className="mb-2">Détecter et prévenir les activités frauduleuses ou abusives</li>
                <li className="mb-2">Vous envoyer des notifications et des mises à jour concernant notre service</li>
              </ul>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                4. Partage de vos informations
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Nous ne vendons pas vos informations personnelles à des tiers. Nous pouvons partager vos informations dans les circonstances suivantes :
              </p>
              <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
                <li className="mb-2">Avec d'autres utilisateurs lorsque vous communiquez avec eux</li>
                <li className="mb-2">Avec nos fournisseurs de services qui nous aident à fournir notre service</li>
                <li className="mb-2">Pour se conformer à la loi ou protéger nos droits</li>
                <li className="mb-2">Dans le cadre d'une fusion, acquisition ou vente d'actifs</li>
              </ul>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                5. Sécurité des données
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Nous prenons des mesures raisonnables pour protéger vos informations contre l'accès, l'utilisation ou la divulgation non autorisés. Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n'est totalement sécurisée.
              </p>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                6. Vos droits
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Selon votre lieu de résidence, vous pouvez avoir certains droits concernant vos informations personnelles, notamment :
              </p>
              <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
                <li className="mb-2">Le droit d'accéder à vos informations</li>
                <li className="mb-2">Le droit de corriger vos informations</li>
                <li className="mb-2">Le droit de supprimer vos informations</li>
                <li className="mb-2">Le droit de restreindre le traitement de vos informations</li>
                <li className="mb-2">Le droit à la portabilité des données</li>
                <li className="mb-2">Le droit de vous opposer au traitement de vos informations</li>
              </ul>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                7. Modifications de cette politique
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Nous vous informerons de tout changement important en publiant la nouvelle politique de confidentialité sur cette page et en vous envoyant une notification.
              </p>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                8. Contact
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter à l'adresse suivante : privacy@messengerclone.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 