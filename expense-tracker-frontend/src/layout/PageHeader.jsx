export default function PageHeader({ title, subtitle, right }) {

    return (

        <div className="sticky top-0 z-20 bg-gray-100 dark:bg-gray-900 pb-4 mb-6">

            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {subtitle}
                        </p>
                    )}

                </div>

                {right && (
                    <div className="flex items-center gap-3">
                        {right}
                    </div>
                )}

            </div>

        </div>

    );
}
