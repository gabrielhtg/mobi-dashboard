import { Component, OnDestroy } from '@angular/core';
import { Editor } from '@tiptap/core';
import { StarterKit } from '@tiptap/starter-kit';
import { NgxTiptapModule } from 'ngx-tiptap';
import { FormsModule, NgForm } from '@angular/forms';
import { CodeBlock } from '@tiptap/extension-code-block';
import { Image } from '@tiptap/extension-image';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../../assets/env';
import { Router, RouterLink } from '@angular/router';
import { showSuccessNotification } from '../allservice';

@Component({
  selector: 'app-add-code-snippets',
  standalone: true,
  templateUrl: './add-code-snippets.component.html',
  imports: [NgxTiptapModule, FormsModule, RouterLink],
})
export class AddCodeSnippetsComponent implements OnDestroy {
  code = '';

  constructor(private http: HttpClient, private router: Router) {}

  editor = new Editor({
    extensions: [
      StarterKit,
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-800 inline-block md:w-full text-white p-2 rounded-lg',
        },
      }),
      Image.configure({
        inline: true,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl my-5 focus:outline-none',
      },
    },
    content: 'Write Here 🤩',
  });

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  submit(addCodeSnippetForm: NgForm) {
    const data = addCodeSnippetForm.value;

    this.http.post<any>(`${apiUrl}/code-snippets`, data).subscribe({
      next: (value) => {
        showSuccessNotification('Berhasil membuat data baru!');

        this.router.navigate(['/dashboard/code-snippets']);
      },
    });
  }
}
