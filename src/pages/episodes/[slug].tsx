import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticProps, GetStaticPaths } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
// import { useRouter } from 'next/router';
import { PlayerContext, usePlayer } from '../../../contexts/PlayerContext';

import { api } from '../../services/api';
import { connvertDurationToTimeString } from '../../utils/connvertDurationToTimeString';

import styles from './episode.module.scss';

type Episode = {
    id: string;
    title: string;
    thumbnail: string;
    members: string;
    duration: number;
    description: string;
    durationAsString: string;
    url: string;
    publishedAt: string;

}

type EpisodeProps = {
    episode: Episode;
}

export default function Episodes( { episode }: EpisodeProps) {    
    const { play  }  = usePlayer();

    return (

        <div className={styles.episode}>
            <Head>
               <title> {episode.title} | Podcastr</title>
            </Head>

           <div className={styles.thumbnailContainer}>
               <button type="button">
                   <img src="/arrow-left.svg" alt="Voltar"/>
               </button>

               <Image 
                width={700} 
                height={160}
                src={episode.thumbnail}
                objectFit="cover" 
              />
               
              <Link href="/">
                <button type="button" onClick={() => play(episode)}>
                    <img src="/play.svg" alt="Tocar episodio"/>
                </button>
              </Link> 
              
           </div>

           <header>
               <h1>{episode.title}</h1>
               <span>{episode.members}</span>
               <span>{episode.publishedAt}</span>
               <span>{episode.durationAsString}</span>
           </header>

           <div className={styles.description} 
             dangerouslySetInnerHTML={{ __html: episode.description}}
           />
             
        </div>
    )
}

// client (browser) - next.js (node.js) - server(backend)
export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],
        fallback: 'blocking'
    }
    // incremental static regeneration
}

export const  getStaticProps: GetStaticProps = async (ctx) => {
    const { slug } = ctx.params;
    const { data } = await api.get(`/episodes/${slug}`);

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
        durationAsString: connvertDurationToTimeString(Number(data.file.duration)),
        description: data.description,
        url: data.file.url,
    }

    return {
        props: {
            episode,
        },
        revalidate: 60 * 60 * 24, // 24hours
    }

}