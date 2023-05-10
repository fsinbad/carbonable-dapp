import type { LoaderFunction, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import type { Project } from "@prisma/client";

import { userPrefs } from "~/cookie";
import LaunchpadCard from "~/components/Project/Overview/ProjectCard";


export const loader: LoaderFunction = async ({
    request, 
  }) => {
    try {
        const cookieHeader = request.headers.get("Cookie");
        const cookie = (await userPrefs.parse(cookieHeader)) || {};

        const selectedNetwork = await db.network.findFirst({
            where: {
              ...(cookie.selected_network !== undefined ? { id: cookie.selected_network } : { isDefault: true }), 
            }
        });

        const indexerURL = selectedNetwork?.id === 'testnet' ? process.env.INDEXER_TESTNET_URL : process.env.INDEXER_URL;

        const allFarms = await fetch(`${indexerURL}/farming/list`, {});
        const allProjects = await allFarms.json();
        return json(allProjects.data);
    } catch (e) {
        console.log(e)
        return json([]);
    }
};

export const meta: V2_MetaFunction = () => {
    return [
        { title: "Carbonable - Web3 powered end-to-end carbon removal platform" },
        { name: "description", content:"The simplest and smartest way to reach Net Zero. Invest in the best nature-based solutions. Manage your assets and drive your strategy efficiently."},
        { name: "image", content: "https://carbonable.io/assets/images/social/social.jpg"},
        { property: 'og:url', content:"https://app.carbonable.io"},
        { property: 'og:type', content: "website"},
        { property: 'og:title', content: "Carbonable - Web3 powered end-to-end carbon removal platform"},
        { property: 'og:description', content: "The simplest and smartest way to reach Net Zero. Invest in the best nature-based solutions. Manage your assets and drive your strategy efficiently."},
        { property: 'og:image', content: "https://carbonable.io/assets/images/social/social.jpg"},
        { property: 'twitter:domain', content: "carbonable.io"},
        { property: 'twitter:url', content: "https://app.carbonable.io"},
        { property: 'twitter:title', content: "Carbonable - Web3 powered end-to-end carbon removal platform"},
        { property: 'twitter:description', content: "The simplest and smartest way to reach Net Zero. Invest in the best nature-based solutions. Manage your assets and drive your strategy efficiently."},
        { property: 'twitter:card', content: "summary_large_image"},
        { property: 'twitter:image', content: "https://carbonable.io/assets/images/social/social.jpg"}
    ]
};

export default function Launchpad() {
    const projects = useLoaderData<unknown>() as Project[];
    console.log(projects)

    return (
        <div className="mx-auto md:mt-12 lg:mt-6 max-w-7xl">
            <div className="relative w-11/12 mx-auto border border-neutral-700 bg-launchpad-header rounded-3xl p-4 flex items-center justify-center flex-wrap md:px-10">
                <div className="w-2/12">
                    <img src="/assets/images/common/logo-green.svg" alt="Carbonable logo green" className="w-full md:w-9/12" />
                </div>
                <h1 className="uppercase w-10/12 pl-8 md:w-6/12 md:pl-2">
                    <div className="font-trash text-lg text-neutral-100 md:text-2xl xl:text-3xl">Long-term yield</div>
                    <div className="font-americana font-thin text-neutral-100 md:text-xl xl:text-2xl">for your wallet</div>
                    <div className="font-trash text-xl bg-primary bg-clip-text text-transparent md:text-3xl xl:text-4xl">and the planet</div>
                </h1>
                <img src="/assets/images/backgrounds/launchpad.svg" alt="world map" className="w-10/12 mx-auto mt-4 md:w-4/12" />
            </div>
            <div className="relative w-11/12 mx-auto mt-12 lg:mt-12 xl:mt-16 mb-12 md:pl-6">
                <div className="uppercase font-inter text-bold text-lg text-center md:text-left md:pl-1 2xl:text-xl">Projects to finance</div>
                <div className="flex flex-wrap items-start justify-center mt-2 md:justify-start">
                    {projects.map((project: Project) => (     
                        <div key={project.slug} className="w-full my-2 mx-2 md:ml-0 md:mr-4 md:w-[31%] lg:w-[31%]">
                            { project.contentReady && 
                                <NavLink to={`/launchpad/${project.slug}`}>
                                    <LaunchpadCard {...project} />
                                </NavLink>
                            }
                            { project.contentReady === false && 
                                <LaunchpadCard {...project} />
                            }
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}