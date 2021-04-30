import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { format, parseISO } from 'date-fns';
import ptBR  from 'date-fns/locale/pt-BR';
import { api } from '../services/api';
import { connvertDurationToTimeString } from '../utils/connvertDurationToTimeString';

import { PlayerContext, usePlayer } from '../../contexts/PlayerContext';
import styles from './home.module.scss';

// spa || ssr || ssg

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
}

type HomeProps = {
  lastedEpisodes: Episode[];
  allEpisodes: Episode[];
}

export default function Home({ lastedEpisodes, allEpisodes }: HomeProps) {
  
  const { playList } = usePlayer(); 
  const episodeList = [...lastedEpisodes, ...allEpisodes];

  return (
   <div className={styles.homePage}>
    <Head>
      <title>Home | Podcastr</title>
    </Head>

     <section className={styles.lastedEpisodes}>
       <h2>Últimos lançamentos  </h2>

       <ul>
         {lastedEpisodes.map((episode, index) => {
           return (
             <li key={episode.id}>
               <Image 
                  width={192} 
                  height={192} 
                  src={episode.thumbnail} 
                  alt={episode.title} 
                  objectFit="cover"
                />

               <div className={styles.episodesDetails}>
                  <Link href={`/episodes/${episode.id}`}>{episode.title}</Link>
                  <p>{episode.members}</p>
                  <span >{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
               </div>

               <button type="button" onClick={() => playList(episodeList, index)}>
                 <img src="/play-green.svg" alt="Toca episodio" title="Tocar episodio"/>
               </button>

             </li>
           )
         })}
       </ul>
     </section>

     <section className={styles.allEpisodes}>
         <h2>Todos episódios</h2>
         <table cellSpacing={0}>
            <thead>
              <tr>
                <th></th>
                <th>Podcast</th>
                <th>Integrantes</th>
                <th>Data</th>
                <th>DUração</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {allEpisodes.map((episode, index) => {
                return (
                  <tr key={episode.id}>
                    <td style={{ width: 72}}>
                      <Image 
                        width={120}
                        height={120}
                        src={episode.thumbnail}
                        alt={episode.title}
                        objectFit="cover"
                      />

                    </td>
                    
                    <td>
                      <Link href={`/episodes/${episode.id}`}>
                         <a >{episode.title}</a>
                      </Link>
                      
                    </td>
                    <td>{episode.members}</td>
                    <td style={{ width: 100 }}>{episode.publishedAt}</td>
                    <td>{episode.durationAsString}</td>

                    <td>
                      <button type="button" onClick={() => playList(episodeList, index + lastedEpisodes.length)}>
                        <img src="/play-green.svg" alt="Tocar episodio"/>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
         </table>
     </section>
   </div>
  )
}


/** server side gerenrator */
export  const getStaticProps: GetStaticProps =  async () => {
  const response = await api.get('episodes', {
     params: {
       _limit: 12,
       _sort: 'publisehd_at',
       _order: 'desc'
     }
  });

  const data =  response.data;


  const episodes = data.map(episode => {
     return {
       id: episode.id,
       title: episode.title,
       thumbnail: episode.thumbnail,
       members: episode.members,
       publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR }),
       duration: Number(episode.file.duration),
       durationAsString: connvertDurationToTimeString(Number(episode.file.duration)),
       url: episode.file.url,
     }
  }); 


  const lastedEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      lastedEpisodes,
      allEpisodes,
    },
    revalidate:60 * 60 * 8, 
  }
}


 // spa
  // useEffect(() => {
  //   fetch('http://localhost:3333/episodes')
  //   .then(response => response.json())
  //   .then( data => console.log(data));

  // }, []);


/** server side render */ 
/** 
export async function getServerSideProps() {
  const response = await fetch('http://localhost:3333/episodes');
  const data =  await response.json();
  return {
    props: {
      episodes: data,
    }
  }
}

*/