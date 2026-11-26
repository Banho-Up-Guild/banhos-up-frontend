import { AfterViewInit, Component, ElementRef, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../header/header-v1/header';
import { Footer } from '../../footer/footer';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Header, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit {
  @ViewChild('heroVideo') private heroVideo?: ElementRef<HTMLVideoElement>;

  readonly autoplayBloqueado = signal(false);

  ngAfterViewInit(): void {
    const video = this.heroVideo?.nativeElement;

    if (!video) {
      return;
    }

    video.muted = true;

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      this.reproduzirVideo(video);
    }
  }

  reproduzirVideo(video: HTMLVideoElement): void {
    video.muted = true;
    video.play().then(() => {
      this.autoplayBloqueado.set(false);
    }).catch((erro: unknown) => {
      if (erro instanceof DOMException && erro.name === 'NotAllowedError') {
        this.autoplayBloqueado.set(true);
        return;
      }

      console.error('Não foi possível reproduzir o vídeo da página inicial:', erro);
    });
  }
}